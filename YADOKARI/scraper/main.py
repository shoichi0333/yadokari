"""
YADOKARI 民泊届出データ自動取得スクリプト
実行: python main.py

処理フロー:
  1. 各都道府県のオープンデータからCSV/Excelを取得
  2. カラムを標準フォーマットに正規化
  3. 住所を国土地理院APIでジオコーディング（緯度経度取得）
  4. JSONファイルとして出力（Next.jsアプリが読み込む）

定期実行:
  GitHub Actionsで毎月1日 09:00 JST に自動実行（.github/workflows/scraper.yml）
"""

import asyncio
import json
import logging
import hashlib
import argparse
from datetime import datetime
from pathlib import Path

import pandas as pd

from prefectures import PREFECTURE_SOURCES
from fetcher import fetch_prefecture_data
from geocoder import geocode_batch

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

OUTPUT_DIR = Path(__file__).parent.parent / "yadokari-app" / "public" / "data"
OUTPUT_FILE = OUTPUT_DIR / "minpaku_listings.json"
CACHE_DIR = Path(__file__).parent / ".cache"


def make_id(prefecture: str, address: str, permit_number: str) -> str:
    raw = f"{prefecture}_{address}_{permit_number}"
    return hashlib.md5(raw.encode()).hexdigest()[:12]


async def run(sources: list[dict] | None = None, dry_run: bool = False) -> int:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    targets = sources or PREFECTURE_SOURCES
    all_listings: list[dict] = []
    failed_sources: list[str] = []
    total_geocoded = 0
    total_failed_geo = 0

    for source in targets:
        df = await fetch_prefecture_data(source)
        if df.empty:
            failed_sources.append(source["name"])
            continue

        df = df[df["address"].str.len() > 5].reset_index(drop=True)
        logger.info(f"[{source['name']}] 有効件数: {len(df)}件")

        has_source_coords = source["type"] == "csv_with_coords"
        geocache: dict[str, list[float]] = {}

        if has_source_coords:
            valid_coords = df["lat"].notna() & df["lng"].notna()
            total_failed_geo += int((~valid_coords).sum())
            logger.info(f"[{source['name']}] 緯度経度付きCSVのためジオコーディングをスキップ: {int(valid_coords.sum())}件")
        else:
            # ジオコーディングキャッシュ（同じ住所は再ジオコードしない）
            cache_file = CACHE_DIR / f"{source['id']}_geocache.json"
            if cache_file.exists():
                with open(cache_file, encoding="utf-8") as f:
                    geocache = json.load(f)

            addresses_to_geocode = [
                addr for addr in df["address"].tolist() if addr not in geocache
            ]

            if addresses_to_geocode:
                logger.info(f"[{source['name']}] ジオコーディング: {len(addresses_to_geocode)}件")
                coords_list = await geocode_batch(addresses_to_geocode)

                for addr, coords in zip(addresses_to_geocode, coords_list):
                    if coords:
                        geocache[addr] = list(coords)
                        total_geocoded += 1
                    else:
                        total_failed_geo += 1

                if not dry_run:
                    with open(cache_file, "w", encoding="utf-8") as f:
                        json.dump(geocache, f, ensure_ascii=False, indent=2)

        def s(val: object, default: str = "") -> str:
            """pandas NaN / None を空文字列に変換して返す"""
            if val is None:
                return default
            try:
                if pd.isna(val):
                    return default
            except (TypeError, ValueError):
                pass
            v = str(val).strip()
            return default if v == "nan" else v

        for _, row in df.iterrows():
            address = s(row.get("address", ""))
            coords = (
                [row.get("lat"), row.get("lng")]
                if has_source_coords and pd.notna(row.get("lat")) and pd.notna(row.get("lng"))
                else geocache.get(address)
            )

            listing = {
                "id": make_id(source["name"], address, s(row.get("permit_number"))),
                "prefecture": source["name"],
                "address": address,
                "permitNumber": s(row.get("permit_number")),
                "permitDate": s(row.get("permit_date")),
                "name": s(row.get("name")) or address,
                "lat": coords[0] if coords else None,
                "lng": coords[1] if coords else None,
                "minpakuType": "JUUTAKU",
                "sourceId": source["id"],
            }
            all_listings.append(listing)

    valid_listings = [l for l in all_listings if l["lat"] and l["lng"]]

    logger.info(
        f"\n完了! 合計: {len(all_listings)}件 | 地図表示可能: {len(valid_listings)}件 | "
        f"ジオコード成功: {total_geocoded}件 | ジオコード失敗: {total_failed_geo}件"
    )

    if failed_sources:
        logger.warning(f"取得失敗した都道府県: {', '.join(failed_sources)}")

    if dry_run:
        logger.info("[dry-run] ファイル出力をスキップ")
        return len(valid_listings)

    # 既存データとマージ（有効データが極端に少ない場合は既存を保持）
    if OUTPUT_FILE.exists() and len(valid_listings) > 0:
        with open(OUTPUT_FILE, encoding="utf-8") as f:
            existing = json.load(f)
        existing_count = existing.get("totalCount", 0)
        if len(valid_listings) < existing_count * 0.5:
            logger.error(
                f"新規データ({len(valid_listings)}件)が既存({existing_count}件)の50%未満 - 上書きを中止"
            )
            return 0

    output = {
        "updatedAt": datetime.now().isoformat(),
        "totalCount": len(valid_listings),
        "listings": valid_listings,
    }
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    logger.info(f"出力完了: {OUTPUT_FILE}")
    return len(valid_listings)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="民泊届出データ取得スクリプト")
    parser.add_argument(
        "--prefecture", "-p",
        help="特定の都道府県だけ実行（例: --prefecture 大阪府）",
        default=None,
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="JSONファイルへの書き出しをスキップ（テスト用）",
    )
    args = parser.parse_args()

    sources = None
    if args.prefecture:
        sources = [s for s in PREFECTURE_SOURCES if s["name"] == args.prefecture]
        if not sources:
            names = [s["name"] for s in PREFECTURE_SOURCES]
            print(f"エラー: '{args.prefecture}' が見つかりません。利用可能: {names}")
            exit(1)

    count = asyncio.run(run(sources=sources, dry_run=args.dry_run))
    print(f"\n結果: {count}件 を出力")
