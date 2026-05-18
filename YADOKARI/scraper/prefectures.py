"""
都道府県別 民泊届出データソース設定
各自治体のオープンデータURLとパース方法を定義する

データソースの種類:
  - csv_url: 直接CSVをダウンロード
  - csv_with_coords: 緯度経度付きCSVをダウンロード
  - excel_url: Excelファイルをダウンロード
  - api: CKAN APIで最新リソースURLを動的取得

最終URL確認: 2026-05-15
"""

PREFECTURE_SOURCES = [
    # ─── 関東 ────────────────────────────────────────────────────
    {
        "id": "tokyo_minato_city",
        "name": "東京都港区",
        "type": "csv_with_coords",
        "url": "https://opendata.city.minato.tokyo.jp/dataset/a5897786-586e-4f35-8670-cb6f9b3c88ba/resource/fa2a84e2-502d-4d2a-9d48-f6d6697a1b44/download/jyutakusyukuhaku_202601.csv",
        "encoding": "utf-8-sig",
        "lat_column": "緯度",
        "lng_column": "経度",
        "columns": {
            "address": ["所在地"],
            "permit_number": ["届出番号"],
            "permit_date": ["届出年月日[西暦]", "届出年月日"],
            "name": ["建物名等", "建物名", "施設名"],
        },
    },
    {
        "id": "kanagawa_pref",
        "name": "神奈川県",
        "type": "excel_url",
        "url": "https://www.pref.kanagawa.jp/documents/26258/20260331_jyutakusyukuhakujigyou_sisetuitiran_.xlsx",
        "sheet": 0,
        "skip_rows": 1,
        "columns": {
            "address": ["住宅の所在地", "所在地", "住所"],
            "permit_number": ["届出番号"],
            "permit_date": ["届出年月日"],
            "name": ["施設名", "物件名", "名称"],
        },
    },
    # ─── 近畿 ────────────────────────────────────────────────────
    {
        "id": "osaka_pref",
        "name": "大阪府",
        "type": "excel_url",
        "url": "https://www.pref.osaka.lg.jp/documents/34854/jyuhaku080401.xlsx",
        "sheet": 0,
        "skip_rows": 5,
        "columns": {
            "address": ["住宅の所在地", "所在地", "住所"],
            "permit_number": ["番号", "届出番号"],
            "permit_date": ["届出年月日"],
            "name": ["施設名", "名称"],
        },
    },
    # ─── 中部 ────────────────────────────────────────────────────
    {
        "id": "aichi_pref",
        "name": "愛知県",
        "type": "csv_url",
        "url": "https://www.pref.aichi.jp/uploaded/attachment/611307.csv",
        "encoding": "cp932",
        "skip_rows": 1,
        "columns": {
            "address": ["届出住宅所在地", "所在地", "住所", "物件所在地"],
            "permit_number": ["届出番号", "番号"],
            "permit_date": ["届出年月日", "受理年月日"],
            "name": ["施設名", "物件名", "名称"],
        },
    },
    {
        "id": "nagano_pref",
        "name": "長野県",
        "type": "excel_url",
        "url": "https://www.pref.nagano.lg.jp/shokusei/seikatsu/documents/todokede20260331.xlsx",
        "sheet": 0,
        "skip_rows": 2,
        "columns": {
            "address": ["住宅の所在地", "住宅̏の所在地", "所在地", "住所"],
            "permit_number": ["届出番号", "管理番号"],
            "permit_date": ["届出年月日"],
            "name": ["施設名", "物件名", "届出者の氏名"],
        },
    },
    {
        "id": "shizuoka_pref",
        "name": "静岡県",
        "type": "csv_url",
        "url": "https://opendata.pref.shizuoka.jp/dataset/8902/resource/85902/%E3%82%AA%E3%83%BC%E3%83%97%E3%83%B3%E3%83%87%E3%83%BC%E3%82%BF%EF%BC%88%EF%BC%92%E6%9C%88%E6%9C%AB%EF%BC%89.csv",
        "encoding": "cp932",
        "no_header": True,
        "col_names": ["permit_number", "address"],
        "columns": {
            "address": ["address"],
            "permit_number": ["permit_number"],
            "permit_date": [],
            "name": [],
        },
    },
]
