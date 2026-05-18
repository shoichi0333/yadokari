"""
住所 → 緯度経度変換（ジオコーディング）
国土地理院 住所検索API を使用（無料・制限なし）
"""

import asyncio
import httpx
import time
import logging

logger = logging.getLogger(__name__)

GSI_GEOCODE_URL = "https://msearch.gsi.go.jp/address-search/AddressSearch"


async def geocode_address(address: str, client: httpx.AsyncClient) -> tuple[float, float] | None:
    """
    住所文字列を緯度経度に変換する。
    国土地理院の住所検索APIを使用（完全無料・APIキー不要）。
    """
    try:
        response = await client.get(
            GSI_GEOCODE_URL,
            params={"q": address},
            timeout=10.0,
        )
        response.raise_for_status()
        results = response.json()

        if not results:
            logger.warning(f"ジオコード結果なし: {address}")
            return None

        # 最初の結果を使用（最も一致度が高い）
        coords = results[0]["geometry"]["coordinates"]
        lng, lat = float(coords[0]), float(coords[1])
        return lat, lng

    except Exception as e:
        logger.error(f"ジオコードエラー ({address}): {e}")
        return None


async def geocode_batch(
    addresses: list[str],
    delay_sec: float = 0.3,  # API負荷軽減のため間隔を空ける
) -> list[tuple[float, float] | None]:
    """
    住所リストをまとめてジオコーディング（並列処理 + レート制限）
    """
    results = []
    async with httpx.AsyncClient() as client:
        for i, address in enumerate(addresses):
            if i > 0 and i % 10 == 0:
                logger.info(f"  ジオコード進捗: {i}/{len(addresses)}")

            result = await geocode_address(address, client)
            results.append(result)

            # レート制限：国土地理院APIへの配慮
            await asyncio.sleep(delay_sec)

    return results
