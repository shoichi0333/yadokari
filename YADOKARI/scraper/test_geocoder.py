"""
ジオコーダーの動作確認スクリプト
実行: python test_geocoder.py
"""

import asyncio
from geocoder import geocode_batch

TEST_ADDRESSES = [
    "大阪府大阪市北区梅田1-1",
    "京都府京都市中京区河原町通四条上る",
    "東京都新宿区歌舞伎町1-1-1",
    "福岡県福岡市博多区博多駅前1-1",
    "沖縄県那覇市久茂地3-1",
]


async def main():
    print("国土地理院APIジオコーダーテスト")
    print("=" * 50)

    results = await geocode_batch(TEST_ADDRESSES, delay_sec=0.5)

    success = 0
    for addr, coords in zip(TEST_ADDRESSES, results):
        if coords:
            print(f"OK  {addr}")
            print(f"    lat={coords[0]:.6f}, lng={coords[1]:.6f}")
            success += 1
        else:
            print(f"NG  {addr}")

    print(f"\n結果: {success}/{len(TEST_ADDRESSES)} 件成功")


if __name__ == "__main__":
    asyncio.run(main())
