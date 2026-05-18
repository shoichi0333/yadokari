"""
国土交通省 不動産情報ライブラリ API の動作確認.

実行:
    python test_reinfolib.py
"""

from __future__ import annotations

import asyncio
import json
import os

from reinfolib_fetcher import fetch_transactions


SAMPLE_OUTPUT = [
    {
        "PriceCategory": "不動産取引価格情報",
        "Type": "中古マンション等",
        "MunicipalityCode": "13104",
        "Prefecture": "東京都",
        "Municipality": "新宿区",
        "DistrictName": "西新宿",
        "TradePrice": "50000000",
        "FloorPlan": "1LDK",
        "Area": "40",
        "BuildingYear": "2008年",
        "Period": "2024年第1四半期",
    }
]


async def main() -> None:
    api_key = os.getenv("REINFOLIB_API_KEY")

    if not api_key:
        print("APIキーを取得してください: https://www.reinfolib.mlit.go.jp/")
        print("環境変数 REINFOLIB_API_KEY に設定すると実APIを呼び出します。")
        print("\nサンプル出力:")
        print(json.dumps(SAMPLE_OUTPUT, ensure_ascii=False, indent=2))
        return

    print("不動産情報ライブラリ API テスト")
    print("=" * 50)

    results = await fetch_transactions(
        api_key,
        year=2024,
        city="13104",
        price_classification="01",
    )

    print(f"取得件数: {len(results)}")
    print("先頭3件:")
    print(json.dumps(results[:3], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
