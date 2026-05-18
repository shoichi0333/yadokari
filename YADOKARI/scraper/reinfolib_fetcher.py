"""
国土交通省 不動産情報ライブラリ API fetcher.

XIT001: 不動産価格（取引価格・成約価格）情報取得 API
"""

from __future__ import annotations

from typing import Any


BASE_URL = "https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001"
API_KEY_HEADER = "Ocp-Apim-Subscription-Key"

PREFECTURE_CODES: dict[str, str] = {
    "13": "東京",
    "27": "大阪",
    "26": "京都",
    "28": "兵庫",
    "23": "愛知",
    "40": "福岡",
    "47": "沖縄",
}

PREFECTURE_NAME_TO_CODE: dict[str, str] = {
    name: code for code, name in PREFECTURE_CODES.items()
}


class ReinfoLibError(RuntimeError):
    """不動産情報ライブラリ API の取得失敗."""


def resolve_prefecture_code(prefecture: str | int) -> str:
    """都道府県コードまたは対応表に含まれる名称から2桁コードを返す."""
    value = str(prefecture).strip()
    if value.isdigit():
        return value.zfill(2)

    normalized = value.removesuffix("都").removesuffix("府").removesuffix("県")
    try:
        return PREFECTURE_NAME_TO_CODE[normalized]
    except KeyError as exc:
        supported = ", ".join(f"{code}={name}" for code, name in PREFECTURE_CODES.items())
        raise ValueError(f"未対応の都道府県です: {prefecture}（対応: {supported}）") from exc


def _clean_params(params: dict[str, Any]) -> dict[str, str]:
    return {key: str(value) for key, value in params.items() if value not in (None, "")}


async def fetch_transactions(
    api_key: str,
    *,
    year: int | str,
    area: str | int | None = None,
    prefecture: str | int | None = None,
    city: str | int | None = None,
    station: str | int | None = None,
    quarter: int | str | None = None,
    price_classification: str | int | None = "01",
    language: str | None = "ja",
    land_type: str | int | None = None,
    timeout: float = 30.0,
) -> list[dict[str, Any]]:
    """
    XIT001 から不動産価格（取引価格・成約価格）情報を取得する.

    price_classification:
        01=不動産取引価格情報のみ, 02=成約価格情報のみ, None=両方
    area/prefecture, city, station のいずれかは必須.
    land_type は過去サンプル互換用。現行マニュアルの主要パラメータではない。
    """
    if not api_key:
        raise ValueError("api_key is required")

    resolved_area = resolve_prefecture_code(prefecture) if prefecture is not None else area
    if resolved_area is None and city is None and station is None:
        raise ValueError("area/prefecture, city, station のいずれかを指定してください")

    params = _clean_params(
        {
            "year": year,
            "quarter": quarter,
            "area": resolve_prefecture_code(resolved_area) if resolved_area is not None else None,
            "city": city,
            "station": station,
            "priceClassification": price_classification,
            "language": language,
            "landType": land_type,
        }
    )

    headers = {API_KEY_HEADER: api_key}
    try:
        import httpx
    except ImportError as exc:
        raise ReinfoLibError("httpx がインストールされていません。scraper/requirements.txt をインストールしてください。") from exc

    async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
        response = await client.get(BASE_URL, params=params, headers=headers)

    if response.status_code == 404:
        return []

    try:
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise ReinfoLibError(
            f"不動産情報ライブラリ API の取得に失敗しました: "
            f"status={response.status_code}, body={response.text[:300]}"
        ) from exc

    payload = response.json()
    if isinstance(payload, dict):
        status = payload.get("status")
        if status and status != "OK":
            raise ReinfoLibError(f"不動産情報ライブラリ API がエラーを返しました: {payload}")
        data = payload.get("data", [])
    else:
        data = payload

    if not isinstance(data, list):
        raise ReinfoLibError(f"想定外のレスポンス形式です: {payload}")

    return data


def fetch_transactions_sync(api_key: str, **kwargs: Any) -> list[dict[str, Any]]:
    """同期コードから fetch_transactions を呼ぶための薄いラッパー."""
    import asyncio

    return asyncio.run(fetch_transactions(api_key, **kwargs))
