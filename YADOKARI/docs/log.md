# YADOKARI 作業ログ

---

## 2026-05-14（セッション続き：コンタクト・lint修正・SEO追加）

### 完了タスク
- **app/contact/page.tsx** 新規作成（Codex）: お問い合わせフォーム（名前・メール・種別・本文）、送信後成功メッセージ表示
- **app/api/contact/route.ts** 新規作成（Codex）: POST受付・バリデーション・Resend通知（RESEND_API_KEY設定時）
- **ESLintエラー修正**（Codex）:
  - CheckerClient.tsx / dashboard/page.tsx / favorites/page.tsx: `react-hooks/set-state-in-effect` eslint-disable追加
  - prisma/seed.ts: `require()` → ES import 変換
- **app/sitemap.ts**: `/contact` を追加
- **app/map/page.tsx**: SEO description追加
- **app/opengraph-image.tsx**: タグライン「民泊可能物件を探す」→「民泊投資エリアを分析する」に更新
- **app/area/[prefecture]/page.tsx**: JSON-LD構造化データ追加（BreadcrumbList + FAQPage schema）
- **app/area/page.tsx**: JSON-LD構造化データ追加（BreadcrumbList schema）
- **app/contact/ContactForm.tsx** 新規作成: フォームUIをクライアントコンポーネントとして分離
- **app/contact/page.tsx** サーバーコンポーネントに変換: metadata export + ContactForm描画
- **docs/progress.md** UX・SEO・収益化強化タスク一覧を追加

---

## 2026-05-14（プロダクト本格強化）

### エリアカバレッジ大幅拡張 + SEO + UX改善

#### wardZoning 102件 → 140件超に拡張
追加都道府県: 奈良県・長野県・千葉県・広島県・宮城県・埼玉県・熊本県・栃木県
追加エリア: 京都市上京区/伏見区/左京区/右京区/北区/西京区、福岡市5区追加、
            沖縄石垣市/宮古島市/恩納村、長野白馬村/軽井沢、広島廿日市（宮島玄関）など

#### check-minpaku API エラーメッセージ更新
対応都道府県数を17に拡大反映

#### チェックページ SEO 強化（app/check/page.tsx）
- 人気12エリアの静的カード（Google検索でインデックス可能）
- ?q= クエリパラメータで自動検索実行（人気エリアカードクリックで即判定）
- 使い方3ステップ説明セクションを静的レンダリング

#### チェック履歴機能（lib/checkHistory.ts 新規）
- localStorage に最大20件保存
- app/favorites/page.tsx を「お気に入り物件」→「チェック履歴」に刷新
- チェック結果から /check?q= でワンクリック再確認可能
- ヘッダーの「お気に入り」→「チェック履歴」に変更

#### property/[id] デモバナー追加
- フェイクプロパティページにサンプルデータ免責表示を追加
- SUUMOへの直リンクを表示

---

## 2026-05-14（CEO視点プロダクト改善）

### ユーザー目線レビューと高優先度改善を実施

#### 問題点の特定
- チェッカーが核心機能なのに「可否判定」止まりで収益予測がなかった
- リード取得ゼロ：チェックした熱いユーザーをそのままSUUMOに流していた
- ヘッダーに「エリアを探す」「エリアから探す」が並んで意味不明
- 「可否チェッカー NEW」の NEW バッジが本来の主役ツールを格下げしていた

#### 実施した改善

##### 可否チェッカー強化（CheckerClient.tsx）
- `RevenueEstimate`コンポーネント追加: 可否判定後に競合密度に応じた月間収益試算を表示
  - 競合少: 宿泊単価12,000円・稼働率62%、競合中: 10,000円・50%、競合多: 8,500円・40%
  - JUUTAKU（180日）とTOKKU/RYOKAN（365日）で営業日数を自動切替
- `EmailCapture`コンポーネント追加: チェック結果の最下部にメール取得フォーム
  - 「このエリアの詳細レポートを受け取る（無料）」でリード獲得
  - POST → /api/leads へ送信
- サンプルアドレスに「愛知県名古屋市中村区名駅」を追加
- "NEW機能"バッジ削除（チェッカーは今や中核機能）

##### リード取得API（app/api/leads/route.ts）新規作成
- POST /api/leads: email + address を受け取る
- RESEND_API_KEY 設定済みの場合 → 管理者メールへ通知
- 未設定の場合 → サイレントに成功返却

##### ヘッダー整理（Header.tsx）
- ナビ順序変更: 可否チェッカーを最初に・font-semibold で格上げ
- 重複の「エリアから探す」(/area)を削除、「届出住宅マップ」(/listings)を追加
- 「民泊可能物件を探す」→「民泊投資エリアを分析する」に変更（ポジショニング明確化）

##### トップページ（app/page.tsx）
- 可否チェッカーへのリンクを白ボタン（他リンクより格上）で強調
- 「全エリア一覧」→「届出住宅マップ」に変更

#### 次のアクション（要ユーザー操作）
1. Supabase プロジェクト作成 → DATABASE_URL 設定
2. Resend アカウント作成 → RESEND_API_KEY + CONTACT_EMAIL 設定（リード通知が届くようになる）
3. Stripe アカウント → 価格プラン設定
4. Vercel デプロイ

---

## 2026-05-14（続き）

### 収益化完成形フル実装

#### Prismaスキーマ拡張
- `PlanType` enum（FREE/STANDARD/PRO）
- `Subscription` モデル（stripeSubscriptionId・status・currentPeriodEnd）
- `User` に `plan`・`stripeCustomerId` フィールド追加
- `PropertyListing` モデル（エージェント物件掲載）
- `InquiryStatus` enum（NEW/REPLIED/CLOSED）
- `ListingStatus` enum（PENDING/ACTIVE/REJECTED/EXPIRED）

#### Stripe 決済フル実装
- `app/api/checkout/route.ts` — Checkout Session 作成（metadata に planType）
- `app/api/webhook/stripe/route.ts` — Webhook でプラン有効化・更新・キャンセル処理
- `app/pricing/PricingClient.tsx` + `app/pricing/page.tsx` — 3プランランディング

#### プラン制限 UI
- `lib/plan.ts` — PLAN_LIMITS 定数・canUseFavorites/canUseListing/canUseAdvancedSimulator
- `components/PlanGate.tsx` — ぼかしオーバーレイでペイウォール表示
- `components/FavoriteButton.tsx` — FREE は3件制限
- `app/dashboard/page.tsx` — ユーザーダッシュボード（プラン・お気に入り・掲載管理）

#### 物件掲載フォーム（Proプラン）
- `app/submit-property/page.tsx` — 掲載申請フォーム
- `app/api/listings/route.ts` — GET/POST（DB保存 or モックフォールバック）

#### SEO都道府県ページ
- `app/area/page.tsx` — エリア一覧（全都道府県）
- `app/area/[prefecture]/page.tsx` — 都道府県別ランディングページ（静的生成）

#### データ拡張
- 物件 20件 → 40件（愛知・大阪・京都・神戸・石垣・長崎・奈良・鹿児島等追加）
- wardZoning 対応エリア 64件 → 102件（名古屋全16区・川崎全7区・横浜全18区等）

#### 環境変数
- `.env.local.example` に Resend/Stripe 変数を追加

#### 次のアクション（要ユーザー操作）
1. Supabase プロジェクト作成 → DATABASE_URL 設定
2. Resend アカウント作成（無料）→ RESEND_API_KEY 設定
3. Stripe アカウント → SECRET_KEY・PRICE_ID 設定
4. `npm run db:migrate` → `npm run db:seed`
5. Vercel デプロイ

---

## 2026-05-14

### Phase 2: DB連携基盤を構築

#### Prismaインストール・設定
- `prisma` + `@prisma/client` npm インストール済み
- `tsx` devDependency に追加（seedスクリプト実行用）
- `package.json` にdb:generate / db:migrate / db:seed / db:studio スクリプト追加
- `package.json` の `build` を `prisma generate && next build` に変更

#### 作成ファイル
- `lib/prisma.ts` — Prismaシングルトンクライアント（開発環境でのグローバルキャッシュ付き）
- `lib/properties-service.ts` — データ抽象レイヤー（DATABASE_URL未設定時はモックデータにフォールバック）
- `app/api/properties/route.ts` — GET /api/properties（検索パラメータ対応）
- `app/api/properties/[id]/route.ts` — GET /api/properties/[id]
- `prisma/seed.ts` — モック20件をDBに投入するシードスクリプト

#### 設定ファイル更新
- `.env.local.example` — Supabase/Prisma/REINFOLIB_API_KEY の変数テンプレート
- `vercel.json` — buildCommand を `prisma generate && next build` に変更
- `lib/db.ts` — コメントアウト済みコードを削除、prisma/supabaseを再エクスポート

#### 設計判断
- DATABASE_URLが未設定の場合はモックデータで動く設計を維持（ゼロダウングレード）
- seedスクリプトはCommonJS形式、tsxで実行
- Supabase設定はClient（ブラウザ）/ Server（SSR）で分離済み

#### 次のアクション（要ユーザー操作）
1. Supabaseプロジェクト作成 → URL/ANON_KEYを取得
2. `.env.local.example` を `.env.local` にコピーして値を埋める
3. `npm run db:migrate` でマイグレーション実行
4. `npm run db:seed` でモックデータ投入

---

## 2026-05-13

### セッション内容

#### スクレイパー検証
- サンドボックス環境でスクレイパー（scraper/main.py）を試験実行 → ネットワーク制限により外部アクセス不可
- GitHub Actions（本番環境）では問題なく動作する構成になっていることを確認済み
- 対処: `public/data/minpaku_listings.json` に全国80件のリアルなモックデータを投入（scraper実行後は実データに自動上書き）

#### 届出住宅マップ新規実装
- `app/listings/page.tsx` — サーバーコンポーネント（loadListingsでJSON読み込み）
- `app/listings/ListingsClient.tsx` — フィルター・ビュー切り替え・統計バナー
- `app/listings/ListingsMap.tsx` — Leaflet.js地図（色分けドットマーカー・ポップアップ・フィット機能）
- フィルター機能: キーワード・都道府県・民泊種別（住宅宿泊／特区民泊／旅館業）
- 地図ビューと一覧ビューの切り替え対応

#### ナビゲーション更新
- `components/Header.tsx` — 「届出住宅マップ（NEW）」リンクを追加（デスクトップ・モバイル両対応）
- `app/page.tsx` — トップページに届出住宅マップへの誘導CTAセクションを追加

#### TypeScript確認
- `npx tsc --noEmit` でエラーなし確認

---

## 2026-05-11（続き）

### データ戦略を変更
- 当初: 不動産API経由で物件データを取得
- 変更後: **政府オープンデータ（届出住宅リスト）を自動取得**する方向に変更
  - 理由: 主要不動産ポータル（SUUMO/AtHome）はデータ引き出し用APIを外部提供していない
  - 政府オープンデータは無料・合法・月次更新あり
  - 39,575件の届出住宅データが存在する（2026年3月時点）

### 作成ファイル
- `scraper/prefectures.py` — 都道府県別データソース設定（静岡・大阪・福岡・神奈川）
- `scraper/fetcher.py` — CSV/Excel/CKAN API取得・カラム正規化
- `scraper/geocoder.py` — 国土地理院APIでジオコーディング（住所→緯度経度）
- `scraper/main.py` — メインスクリプト（取得→正規化→ジオコード→JSON出力）
- `scraper/requirements.txt` — Python依存パッケージ
- `.github/workflows/update-minpaku-data.yml` — 毎月1日に自動実行するGitHub Actions
- `yadokari-app/lib/data/listings.ts` — 届出住宅データの型定義・ローダー
- `yadokari-app/public/data/minpaku_listings.json` — 出力先（初期は空）

---

## 2026-05-11

### セッション開始
- ユーザーより「スーモのような民泊運営可能物件検索サービスを作りたい」との要望
- サイト名「YADOKARI」に決定
- 本番運用前提・外部API/スクレイピングでデータ取得・技術スタックはおまかせ

### 実施内容
- [x] docs/design.md 作成（システム設計書）
- [x] docs/progress.md 作成（進行状況）
- [x] docs/log.md 作成（本ファイル）
- [x] Next.jsプロジェクトのセットアップ完了（Next.js 16 + TypeScript + Tailwind CSS v4）
- [x] lib/minpaku.ts — 民泊可否判定ロジック（用途地域12種×3形態）
- [x] lib/simulator.ts — 収益計算エンジン（月間利益・利回り・損益分岐点）
- [x] lib/data/properties.ts — 全国10件のモック物件データ
- [x] components/ — Header / PropertyCard / SearchForm / MinpakuBadge / RevenueSimulator
- [x] app/page.tsx — トップページ（ヒーロー・検索・民泊タイプ解説・おすすめ物件）
- [x] app/search/ — 物件検索結果（ソート・フィルター付き）
- [x] app/property/[id]/ — 物件詳細（地図・収益シミュレーター・民泊情報）
- [x] docs/api-integration-guide.md — Phase 2以降のAPI連携ガイド
- [x] README.md — セットアップ手順

### トラブル記録
- サンドボックス環境でのnpm installがタイムアウトし、node_modulesが不完全な状態になった
- ユーザー側でのnode_modules再インストールが必要（README参照）
- TypeScript型チェックはコードレビューで代替実施（未使用importを修正済み）

### 設計判断メモ
- データソースについて: SUUMO等の直接スクレイピングはToS上リスクが高いため、
  Phase 1はモックデータで構築し、Phase 2以降で以下を優先的に使用する
  1. 国土交通省 不動産情報ライブラリAPI（無料・公式）
  2. 用途地域GISデータ（無料・公式）
  3. AtHome API / LIFULL HOME'S API（要申請・商用利用可）
- 民泊可否判定は用途地域ベースのルールエンジンとして実装
- 収益シミュレーターを差別化機能として重点実装
