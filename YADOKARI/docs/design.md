# YADOKARI システム設計書

> ヤドカリ — 民泊運営可能物件に特化した不動産検索サービス

---

## 1. サービス概要

住宅宿泊事業法（民泊新法）・旅館業法に基づき、**民泊運営が可能な物件だけを検索できる**不動産ポータルサイト。SUUMO のような使いやすさで、民泊投資家・運営者に特化した情報を提供する。

---

## 2. ターゲットユーザー

| ユーザー | ニーズ |
|---------|--------|
| 民泊投資初心者 | どのエリア・物件が民泊OKかわからない |
| 既存民泊オーナー | 2軒目・3軒目の物件を探している |
| 不動産エージェント | 民泊向け物件を仲介したい |

---

## 3. 主要機能

### 3-1. 物件検索
- エリア検索（都道府県 → 市区町村 → 路線・駅）
- 条件絞り込み（家賃・間取り・築年数・面積）
- 民泊タイプフィルター（住宅宿泊 / 特区民泊 / 旅館業）
- 地図表示（Leaflet.js）

### 3-2. 民泊可否判定バッジ
- 用途地域データを元に自動判定
- 180日制限あり（住宅宿泊事業法）
- 年間無制限（特区民泊 / 旅館業許可）

### 3-3. 収益シミュレーター
- 入力：宿泊単価・稼働率・運営経費
- 出力：月次・年次収益予測、表面利回り

### 3-4. 物件詳細
- 写真ギャラリー
- 周辺施設情報（観光地・交通アクセス）
- 民泊許可取得のための行政窓口リンク

---

## 4. 技術スタック

| 層 | 技術 |
|----|------|
| フロントエンド | Next.js 14 (App Router) + TypeScript |
| スタイリング | Tailwind CSS + shadcn/ui |
| 地図 | Leaflet.js |
| データベース | PostgreSQL + PostGIS（Supabase） |
| ORM | Prisma |
| バックエンドAPI | Next.js API Routes |
| 外部データ取得 | Python スクレイパー（別サービス） |
| デプロイ | Vercel（フロント） + Supabase（DB） |

---

## 5. データモデル

### Property（物件）
```
id              UUID
title           String        // 物件名
address         String        // 住所
prefecture      String        // 都道府県
city            String        // 市区町村
lat             Float         // 緯度
lng             Float         // 経度
rent            Int           // 賃料（円）
layout          String        // 間取り（1K, 2LDK等）
area_sqm        Float         // 専有面積（㎡）
age_years       Int           // 築年数
floor           Int           // 階数
building_floors Int           // 総階数
minpaku_type    Enum          // JUUTAKU / TOKKU / RYOKAN / UNKNOWN
zoning          String        // 用途地域
minpaku_ok      Boolean       // 民泊可否
max_days        Int?          // 最大営業日数（180 or null）
images          String[]      // 画像URL配列
source_url      String?       // 元データURL
created_at      DateTime
updated_at      DateTime
```

### MinpakuEstimate（収益試算キャッシュ）
```
id              UUID
property_id     UUID
nightly_rate    Int           // 宿泊単価（円）
occupancy_rate  Float         // 稼働率（0.0〜1.0）
monthly_cost    Int           // 月間経費（円）
monthly_revenue Int           // 月間収益（円）
annual_yield    Float         // 表面利回り（%）
calculated_at   DateTime
```

---

## 6. 民泊可否判定ロジック

| 用途地域 | 住宅宿泊（180日） | 特区民泊 | 旅館業 |
|---------|----------------|---------|--------|
| 第1種低層住居専用 | ○ | 条件次第 | 難 |
| 第2種低層住居専用 | ○ | 条件次第 | 難 |
| 第1〜2種中高層住居専用 | ○ | 条件次第 | ○ |
| 第1〜2種住居・準住居 | ○ | ○ | ○ |
| 近隣商業・商業 | ○ | ○ | ○ |
| 準工業 | ○ | △ | ○ |
| 工業 | ✕ | ✕ | ✕ |
| 工業専用 | ✕ | ✕ | ✕ |

---

## 7. 外部データソース

### 優先度高
1. **国土交通省 不動産情報ライブラリ API**
   - URL: https://www.reinfolib.mlit.go.jp/
   - 内容：不動産取引価格情報（無料・APIキー要）
   
2. **国土数値情報 用途地域データ**
   - URL: https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-A29.html
   - 内容：全国の用途地域GISデータ（シェープファイル）

### 優先度中
3. **At Home API**（要申請）
4. **LIFULL HOME'S API**（要申請）

---

## 8. フォルダ構成

```
YADOKARI/
├── docs/
│   ├── design.md         # 本ファイル
│   ├── progress.md       # 進行状況
│   └── log.md            # 作業ログ
├── app/                  # Next.js App Router
│   ├── (site)/           # 公開サイト
│   │   ├── page.tsx      # トップページ
│   │   ├── search/       # 検索結果
│   │   └── property/     # 物件詳細
│   └── api/              # API Routes
│       ├── properties/
│       └── simulate/
├── components/           # UIコンポーネント
├── lib/                  # ユーティリティ
│   ├── data/             # モックデータ
│   ├── minpaku.ts        # 民泊判定ロジック
│   └── simulator.ts      # 収益シミュレーター
├── prisma/               # DB スキーマ
└── scraper/              # Pythonスクレイパー（別サービス）
```

---

## 9. 今後のロードマップ

| フェーズ | 内容 | 目安 |
|---------|------|------|
| Phase 1（現在） | Next.js + モックデータで全画面実装 | 完了次第 |
| Phase 2 | Supabase DB連携 + 不動産情報ライブラリAPI | 1ヶ月 |
| Phase 3 | Pythonスクレイパー稼働 + データ自動更新 | 2ヶ月 |
| Phase 4 | ユーザー認証・お気に入り・通知機能 | 3ヶ月 |
| Phase 5 | 有料プラン・エージェント向け管理画面 | 6ヶ月 |
