# YADOKARI 外部データ連携ガイド

## 概要

Phase 1のモックデータから本番データへの移行戦略。スクレイピングリスクを回避しながら、実データで物件情報を充実させる方法をまとめる。

---

## 1. 推奨データソース（優先順）

### ① 国土交通省 不動産情報ライブラリ API ★最優先

**URL**: https://www.reinfolib.mlit.go.jp/  
**コスト**: 無料  
**認証**: APIキー（無料登録）  
**提供データ**: 不動産取引価格情報（成約事例）

```bash
# APIキー取得手順
# 1. https://www.reinfolib.mlit.go.jp/ にアクセス
# 2. 利用者登録（無料）
# 3. APIキーを発行

# サンプルリクエスト（東京都新宿区の取引情報）
curl "https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001?year=2024&area=13104&landType=01" \
  -H "Ocp-Apim-Subscription-Key: YOUR_API_KEY"
```

**注意**: 取引「成約事例」データのため、現在の賃貸物件情報ではない。参考価格として活用する。

#### 不動産情報ライブラリ API 連携メモ

- **APIキー取得URL**: https://www.reinfolib.mlit.go.jp/
- **環境変数名**: `REINFOLIB_API_KEY`
- **対象エンドポイント**: `XIT001`（不動産価格（取引価格・成約価格）情報取得API）
- **取得できるデータ**: 不動産取引価格情報および成約価格情報。実際に取引・成約した事例データであり、現在募集されている賃貸物件情報ではない。YADOKARI では相場把握や参考価格の補助データとして扱う。

```bash
# APIキー未設定の場合: サンプル出力を表示
python scraper/test_reinfolib.py

# APIキー設定後: 実APIを呼び出し、件数と先頭3件を表示
set REINFOLIB_API_KEY=YOUR_API_KEY
python scraper/test_reinfolib.py
```

---

### ② 国土数値情報 用途地域GISデータ

**URL**: https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-A29.html  
**コスト**: 無料  
**フォーマット**: GML / Shapefile

```python
# Python で shapefile を読み込む例
import geopandas as gpd
from shapely.geometry import Point

# 用途地域データの読み込み
gdf = gpd.read_file("A29-19_GML/A29-19_13.shp")  # 東京都
gdf = gdf.to_crs("EPSG:4326")  # WGS84に変換

def get_zoning(lat: float, lng: float) -> str:
    """緯度経度から用途地域を返す"""
    point = Point(lng, lat)
    for _, row in gdf.iterrows():
        if row.geometry.contains(point):
            return row["A29_003"]  # 用途地域コード
    return "不明"

# 用途地域コード → 名称マッピング
ZONING_CODE_MAP = {
    "1": "第一種低層住居専用地域",
    "2": "第二種低層住居専用地域",
    "3": "第一種中高層住居専用地域",
    "4": "第二種中高層住居専用地域",
    "5": "第一種住居地域",
    "6": "第二種住居地域",
    "7": "準住居地域",
    "8": "近隣商業地域",
    "9": "商業地域",
    "10": "準工業地域",
    "11": "工業地域",
    "12": "工業専用地域",
}
```

---

### ③ AtHome API（要申請）

**URL**: https://www.athome.co.jp/  
**コスト**: 法人契約（有料）  
**申請**: 個別問い合わせ  
**提供データ**: 賃貸・売買物件情報（リアルタイム）

---

### ④ LIFULL HOME'S API（要申請）

**URL**: https://opendata.homes.co.jp/  
**コスト**: 提携契約（条件あり）  
**申請**: 個別問い合わせ  
**提供データ**: 賃貸・売買物件情報

---

## 2. スクレイパー設計（スクレイピングの場合）

> ⚠️ **重要**: 対象サイトの利用規約を必ず確認すること。多くの不動産ポータルはスクレイピングを禁止している。商用利用の場合は特に注意。

### 推奨構成

```
scraper/
├── scrapers/
│   ├── base.py           # 基底クラス
│   ├── suumo.py          # ※利用規約要確認
│   └── homes.py          # ※利用規約要確認
├── pipeline/
│   ├── dedup.py          # 重複排除
│   ├── geocode.py        # ジオコーディング（住所→緯度経度）
│   └── zoning.py         # 用途地域判定
├── storage/
│   └── postgres.py       # DBへの書き込み
├── scheduler.py          # 定期実行（APScheduler）
└── requirements.txt
```

### requirements.txt

```
playwright==1.44.0
beautifulsoup4==4.12.3
httpx==0.27.0
geopandas==0.14.4
shapely==2.0.4
psycopg2-binary==2.9.9
sqlalchemy==2.0.30
apscheduler==3.10.4
python-dotenv==1.0.1
```

### ジオコーディング（住所→緯度経度）

```python
import httpx

async def geocode(address: str) -> tuple[float, float] | None:
    """国土地理院 APIでジオコーディング（無料・無制限）"""
    url = "https://msearch.gsi.go.jp/address-search/AddressSearch"
    r = await httpx.AsyncClient().get(url, params={"q": address})
    data = r.json()
    if not data:
        return None
    coords = data[0]["geometry"]["coordinates"]
    return float(coords[1]), float(coords[0])  # lat, lng
```

---

## 3. データベース設計（PostgreSQL + PostGIS）

```sql
-- PostGIS拡張
CREATE EXTENSION IF NOT EXISTS postgis;

-- 物件テーブル
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    prefecture VARCHAR(10) NOT NULL,
    city VARCHAR(50) NOT NULL,
    nearest_station VARCHAR(50),
    minutes_to_station INT,
    location GEOGRAPHY(POINT, 4326),  -- PostGIS地理型
    rent INT NOT NULL,
    layout VARCHAR(20),
    area_sqm DECIMAL(6,2),
    age_years INT,
    floor INT,
    building_floors INT,
    zoning VARCHAR(50),
    is_tokku_area BOOLEAN DEFAULT FALSE,
    minpaku_type VARCHAR(20),  -- JUUTAKU / TOKKU / RYOKAN / NG
    max_days INT,
    images TEXT[],
    features TEXT[],
    description TEXT,
    source_url TEXT,
    source_site VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 地理検索用インデックス
CREATE INDEX properties_location_idx ON properties USING GIST(location);
CREATE INDEX properties_prefecture_idx ON properties(prefecture);
CREATE INDEX properties_minpaku_type_idx ON properties(minpaku_type);

-- 範囲内物件検索（例：新宿駅から半径3km）
SELECT *, ST_Distance(location, ST_MakePoint(139.7006, 35.6905)::GEOGRAPHY) AS dist
FROM properties
WHERE ST_DWithin(location, ST_MakePoint(139.7006, 35.6905)::GEOGRAPHY, 3000)
  AND minpaku_type != 'NG'
ORDER BY dist;
```

---

## 4. Next.js → DB連携（Prisma）

### prisma/schema.prisma

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Property {
  id              String    @id @default(uuid())
  title           String
  address         String
  prefecture      String
  city            String
  nearestStation  String?
  minutesToStation Int?
  lat             Float
  lng             Float
  rent            Int
  layout          String?
  areaSqm         Float?
  ageYears        Int?
  floor           Int?
  buildingFloors  Int?
  zoning          String?
  isTokkuArea     Boolean   @default(false)
  minpakuType     String?
  maxDays         Int?
  images          String[]
  features        String[]
  description     String?
  sourceUrl       String?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

---

## 5. Supabaseを使った簡易セットアップ

```bash
# Supabase CLIインストール
npm install -g supabase

# プロジェクト初期化
supabase init

# DBマイグレーション
supabase db push

# 環境変数設定
echo "DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres" >> .env.local
```

---

## 6. Vercelデプロイ設定

```bash
# Vercel CLIインストール
npm install -g vercel

# デプロイ
vercel

# 環境変数設定
vercel env add DATABASE_URL
```

### vercel.json

```json
{
  "buildCommand": "prisma generate && next build",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```
