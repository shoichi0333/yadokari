"""
都道府県別オープンデータの取得・パース処理
CSV / Excel / CKAN API に対応
"""

import io
import logging
import httpx
import pandas as pd
from typing import Optional

logger = logging.getLogger(__name__)


def find_column(df: pd.DataFrame, candidates: list[str]) -> Optional[str]:
    """候補カラム名のどれかがDataFrameに存在すれば返す"""
    for col in candidates:
        for actual_col in df.columns:
            if col in str(actual_col):
                return actual_col
    return None


def normalize_df(df: pd.DataFrame, col_map: dict) -> pd.DataFrame:
    """
    各自治体によってバラバラなカラム名を統一フォーマットに変換する
    """
    result = pd.DataFrame()

    for standard_name, candidates in col_map.items():
        matched = find_column(df, candidates)
        if matched:
            result[standard_name] = df[matched].astype(str).str.strip()
        else:
            result[standard_name] = ""
            logger.warning(f"カラムが見つかりません: {standard_name} (候補: {candidates})")

    return result.fillna("")


def normalize_df_with_coords(df: pd.DataFrame, source: dict) -> pd.DataFrame:
    """
    緯度経度カラムを持つCSVを標準フォーマットに変換する
    """
    result = normalize_df(df, source["columns"])

    lat_candidates = [
        source.get("lat_column"),
        source.get("latitude_column"),
        "緯度",
        "latitude",
        "lat",
    ]
    lng_candidates = [
        source.get("lng_column"),
        source.get("longitude_column"),
        "経度",
        "longitude",
        "lng",
        "lon",
    ]

    lat_col = find_column(df, [c for c in lat_candidates if c])
    lng_col = find_column(df, [c for c in lng_candidates if c])

    if not lat_col or not lng_col:
        raise ValueError(
            f"緯度経度カラムが見つかりません: lat={source.get('lat_column')}, lng={source.get('lng_column')}"
        )

    result["lat"] = pd.to_numeric(df[lat_col], errors="coerce")
    result["lng"] = pd.to_numeric(df[lng_col], errors="coerce")
    return result


async def fetch_csv(url: str, encoding: str = "utf-8-sig", skip_rows: int = 0, no_header: bool = False, col_names: list | None = None) -> pd.DataFrame:
    """CSVをダウンロードしてDataFrameに変換"""
    async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
        response = await client.get(url)
        response.raise_for_status()
        content = response.content
    return pd.read_csv(
        io.BytesIO(content),
        encoding=encoding,
        skiprows=skip_rows if skip_rows > 0 else None,
        header=None if no_header else 0,
        names=col_names,
        on_bad_lines="skip",
        encoding_errors="replace",
    )


async def fetch_csv_with_coords(source: dict) -> pd.DataFrame:
    """緯度経度付きCSVをダウンロードして標準フォーマットに変換"""
    raw_df = await fetch_csv(source["url"], source.get("encoding", "utf-8-sig"))
    logger.info(f"[{source['name']}] 取得成功: {len(raw_df)}件 / カラム: {list(raw_df.columns)}")
    return normalize_df_with_coords(raw_df, source)


async def fetch_excel(url: str, sheet: int = 0, skip_rows: int = 0) -> pd.DataFrame:
    """ExcelをダウンロードしてDataFrameに変換"""
    async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
        response = await client.get(url)
        response.raise_for_status()
        content = response.content
    return pd.read_excel(io.BytesIO(content), sheet_name=sheet, skiprows=skip_rows)


async def fetch_via_ckan_api(api_url: str, encoding: str = "utf-8-sig") -> pd.DataFrame:
    """
    CKAN APIから最新リソースのCSV URLを取得してダウンロード
    静岡県などCKAN基盤のオープンデータポータルで利用可能
    """
    async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
        response = await client.get(api_url)
        response.raise_for_status()
        data = response.json()

    # CKANレスポンスからCSVリソースのURLを探す
    resources = data.get("result", {}).get("resources", [])
    csv_url = None
    for resource in resources:
        if resource.get("format", "").upper() == "CSV":
            csv_url = resource.get("url")
            break

    if not csv_url:
        raise ValueError(f"CSVリソースが見つかりません: {api_url}")

    logger.info(f"CKAN APIからCSV URL取得: {csv_url}")
    return await fetch_csv(csv_url, encoding=encoding)


async def fetch_prefecture_data(source: dict) -> pd.DataFrame:
    """
    都道府県ソース設定に基づいてデータを取得・正規化する
    """
    name = source["name"]
    source_type = source["type"]

    logger.info(f"[{name}] データ取得開始 (type={source_type})")

    try:
        if source_type == "csv_url":
            raw_df = await fetch_csv(
                source["url"],
                source.get("encoding", "utf-8-sig"),
                skip_rows=source.get("skip_rows", 0),
                no_header=source.get("no_header", False),
                col_names=source.get("col_names"),
            )

        elif source_type == "csv_with_coords":
            normalized = await fetch_csv_with_coords(source)
            normalized["prefecture"] = name
            normalized["source_id"] = source["id"]
            return normalized

        elif source_type == "excel_url":
            raw_df = await fetch_excel(
                source["url"],
                sheet=source.get("sheet", 0),
                skip_rows=source.get("skip_rows", 0),
            )

        elif source_type == "api":
            raw_df = await fetch_via_ckan_api(source["api_url"], source.get("encoding", "utf-8-sig"))

        else:
            raise ValueError(f"未知のソースタイプ: {source_type}")

        logger.info(f"[{name}] 取得成功: {len(raw_df)}件 / カラム: {list(raw_df.columns)}")

        # カラムを標準フォーマットに変換
        normalized = normalize_df(raw_df, source["columns"])
        normalized["prefecture"] = name
        normalized["source_id"] = source["id"]

        return normalized

    except Exception as e:
        logger.error(f"[{name}] 取得失敗: {e}")
        return pd.DataFrame()
