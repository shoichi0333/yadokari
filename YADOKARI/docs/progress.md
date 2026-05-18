# YADOKARI 進行状況

最終更新: 2026-05-13

---

## 全体進捗

| フェーズ | ステータス | 完了率 |
|---------|-----------|--------|
| Phase 1: Next.js + モックデータ | ✅ 完了 | 100% |
| Phase 1.5: 届出住宅マップ実装 | ✅ 完了 | 100% |
| Phase 1.5+: 認証・お気に入り（mock） | ✅ 完了 | 100% |
| Phase 3: スクレイパー基盤構築 | ✅ 基盤完了 | 80% |
| Phase 2: DB + 外部API連携 | 🔄 進行中 | 70% |
| Phase 4: ユーザー認証本番化・通知 | ⏳ 未着手 | 0% |
| Phase 5: 有料プラン | ⏳ 未着手 | 0% |

---

## Phase 1 タスク詳細

| # | タスク | ステータス |
|---|--------|-----------|
| 1 | 設計書・ログファイル作成 | ✅ 完了 |
| 2 | Next.jsプロジェクトセットアップ | ✅ 完了 |
| 3 | データ層・民泊判定ロジック実装 | ✅ 完了 |
| 4 | 検索・一覧画面実装 | ✅ 完了 |
| 5 | 物件詳細・収益シミュレーター実装 | ✅ 完了 |
| 6 | 外部API連携ガイド作成 | ✅ 完了 |
| 7 | 動作確認・コードレビュー | ✅ 完了 |

---

## Phase 1.5 タスク詳細

| # | タスク | ステータス |
|---|--------|-----------|
| 1 | minpaku_listings.json に全国80件のモックデータ投入 | ✅ 完了 |
| 2 | app/listings/page.tsx（サーバーコンポーネント） | ✅ 完了 |
| 3 | app/listings/ListingsClient.tsx（フィルター・統計） | ✅ 完了 |
| 4 | app/listings/ListingsMap.tsx（Leaflet地図） | ✅ 完了 |
| 5 | ヘッダーに届出住宅マップリンク追加 | ✅ 完了 |
| 6 | トップページにCTAセクション追加 | ✅ 完了 |

---

## 作成済みファイル一覧

### ドキュメント
- `docs/design.md` — システム設計書（データモデル・民泊判定ロジック・ロードマップ）
- `docs/progress.md` — 本ファイル
- `docs/log.md` — 作業ログ
- `docs/api-integration-guide.md` — 外部API・DB連携ガイド（国交省API・PostGIS・Prisma）
- `README.md` — セットアップ手順

### Next.jsアプリ（yadokari-app/）
- `app/layout.tsx` — グローバルレイアウト（ヘッダー・フッター）
- `app/page.tsx` — トップページ（ヒーロー・物件一覧・民泊タイプ解説）
- `app/search/page.tsx` — 検索結果ページ
- `app/search/SearchResultsClient.tsx` — 検索・ソート・フィルタークライアント
- `app/property/[id]/page.tsx` — 物件詳細ページ
- `app/property/[id]/MapEmbed.tsx` — Leaflet.js地図コンポーネント
- `components/Header.tsx` — ナビゲーションヘッダー
- `components/PropertyCard.tsx` — 物件カード
- `components/SearchForm.tsx` — 検索フォーム
- `components/MinpakuBadge.tsx` — 民泊種別バッジ
- `components/RevenueSimulator.tsx` — 収益シミュレーター（スライダーUI）
- `lib/minpaku.ts` — 民泊可否判定ロジック（用途地域ルールエンジン）
- `lib/simulator.ts` — 収益計算ロジック
- `lib/data/properties.ts` — モック物件データ（全国10件）

---

## 起動方法

```bash
cd yadokari-app
rmdir /s /q node_modules   # 初回のみ（破損したnode_modulesを削除）
npm install
npm run dev
# → http://localhost:3000
```

---

## 決定事項

- **サイト名**: YADOKARI（ヤドカリ）
- **技術スタック**: Next.js 16 + TypeScript + Tailwind CSS v4 + Leaflet.js
- **データ**: Phase 1はモックデータ。Phase 2から国土交通省API + スクレイピング
- **デプロイ先**: Vercel + Supabase（予定）

---

## 追加済みファイル（Phase 1.5）

- `yadokari-app/app/listings/page.tsx` — 届出住宅マップ（サーバーコンポーネント）
- `yadokari-app/app/listings/ListingsClient.tsx` — フィルター・ビュー切り替え・統計バナー
- `yadokari-app/app/listings/ListingsMap.tsx` — Leaflet.js地図（色分けドット・ポップアップ）
- `yadokari-app/public/data/minpaku_listings.json` — 全国80件モックデータ投入済み

---

## Phase 1.5+ 追加実装（Claude Code）

| # | タスク | ステータス |
|---|--------|-----------|
| 1 | 認証（login/register）mockページ実装 | ✅ 完了 |
| 2 | お気に入り機能（localStorage） | ✅ 完了 |
| 3 | Toast通知システム | ✅ 完了 |
| 4 | ContactModal（問い合わせフォーム） | ✅ 完了 |
| 5 | 検索結果マップ（SearchResultsMap） | ✅ 完了 |
| 6 | 404 / エラーページ | ✅ 完了 |
| 7 | sitemap.ts / robots.ts | ✅ 完了 |
| 8 | モック物件を10件→20件に拡張 | ✅ 完了 |

## Phase 3 スクレイパー基盤

| # | タスク | ステータス |
|---|--------|-----------|
| 1 | prefectures.py（14都道府県定義） | ✅ 完了 |
| 2 | fetcher.py（CSV/Excel/CKAN API対応） | ✅ 完了 |
| 3 | geocoder.py（国土地理院API） | ✅ 完了 |
| 4 | main.py（--prefecture / --dry-run対応） | ✅ 完了 |
| 5 | .github/workflows/scraper.yml（月次自動実行） | ✅ 完了 |
| 6 | 本番環境での実行・件数増加 | ⏳ GitHub Actions初回実行待ち |

## Phase 2 実装状況（2026-05-14）

| # | タスク | ステータス |
|---|--------|-----------|
| 1 | Prisma v5インストール + generate | ✅ 完了 |
| 2 | lib/prisma.ts（シングルトンクライアント） | ✅ 完了 |
| 3 | lib/properties-service.ts（DB/mockフォールバック） | ✅ 完了 |
| 4 | app/api/properties/route.ts | ✅ 完了 |
| 5 | app/api/properties/[id]/route.ts | ✅ 完了 |
| 6 | prisma/seed.ts（モック20件投入スクリプト） | ✅ 完了 |
| 7 | .env.local.example 更新 | ✅ 完了 |
| 8 | vercel.json（prisma generate && next build） | ✅ 完了 |
| 9 | TypeScript型チェック通過 | ✅ 完了 |
| 10 | Supabase プロジェクト作成（要ユーザー操作） | ⏳ 待機 |
| 11 | .env.local に接続情報を設定（要ユーザー操作） | ⏳ 待機 |
| 12 | npm run db:migrate（要ユーザー操作） | ⏳ 待機 |
| 13 | npm run db:seed（要ユーザー操作） | ⏳ 待機 |
| 14 | Vercelデプロイ | ⏳ 待機 |

## UX・SEO・収益化強化（2026-05-14 続き）

| # | タスク | ステータス |
|---|--------|-----------|
| 1 | wardZoning 102件→140件超に拡張（8都道府県追加） | ✅ 完了 |
| 2 | check-minpaku APIエラーメッセージ更新（17都道府県対応） | ✅ 完了 |
| 3 | lib/checkHistory.ts 新規作成（localStorage最大20件） | ✅ 完了 |
| 4 | app/favorites/page.tsx → チェック履歴ページに刷新 | ✅ 完了 |
| 5 | CheckerClient.tsx 強化（RevenueEstimate + EmailCapture） | ✅ 完了 |
| 6 | app/check/page.tsx SEO強化（人気12エリア静的カード） | ✅ 完了 |
| 7 | app/api/leads/route.ts 新規作成（リード取得API） | ✅ 完了 |
| 8 | Header.tsx ナビ整理・タグライン変更 | ✅ 完了 |
| 9 | app/page.tsx CTAリンク整理 | ✅ 完了 |
| 10 | app/area/page.tsx wardZoningベースに刷新 | ✅ 完了 |
| 11 | app/area/[prefecture]/page.tsx 都道府県SEOページ刷新 | ✅ 完了 |
| 12 | app/dashboard/page.tsx チェック履歴表示に刷新 | ✅ 完了 |
| 13 | app/property/[id]/page.tsx デモバナー追加 | ✅ 完了 |
| 14 | app/sitemap.ts wardZoning基準に更新（偽物件URL削除） | ✅ 完了 |
| 15 | app/layout.tsx フッターcontactリンク修正 | ✅ 完了 |
| 16 | app/contact/page.tsx 新規作成（サーバーコンポーネント+metadata） | ✅ 完了 |
| 17 | app/api/contact/route.ts 新規作成 | ✅ 完了 |
| 18 | app/contact/ContactForm.tsx（クライアントフォームコンポーネント） | ✅ 完了 |
| 19 | JSON-LD構造化データ（area/page.tsx + area/[prefecture]/page.tsx） | ✅ 完了 |

## コンテンツ・SEO拡充（2026-05-15）

| # | タスク | ステータス |
|---|--------|-----------|
| 1 | app/area/[prefecture]/[ward]/page.tsx 新規作成（135+静的ward SEOページ） | ✅ 完了 |
| 2 | app/sitemap.ts にwardPages・blogPages・terms・privacy追加 | ✅ 完了 |
| 3 | app/robots.ts /dashboard/ disallow追加 | ✅ 完了 |
| 4 | wardZoning 130件→145件超（名古屋16区、新潟・千葉市・北九州追加） | ✅ 完了 |
| 5 | prefecture→wardページへの内部リンク修正（checker直リンク→ward詳細ページ） | ✅ 完了 |
| 6 | lib/data/blogPosts.ts 新規作成（5記事）| ✅ 完了 |
| 7 | app/blog/page.tsx + app/blog/[slug]/page.tsx 新規作成 | ✅ 完了 |
| 8 | app/page.tsx 民泊コラムセクション追加 | ✅ 完了 |
| 9 | フッター・モバイルメニューにコラムリンク追加 | ✅ 完了 |
| 10 | ward/prefecture各ページにブログ相互リンク追加（東京・大阪・京都・愛知） | ✅ 完了 |
| 11 | app/submit-property: server wrapper + SubmitPropertyForm.tsx に分離（metadata追加） | ✅ 完了 |
| 12 | pricing/search/area index ページのmetadata強化 | ✅ 完了 |
| 13 | 全ページビルドチェック通過（エラー・警告ゼロ） | ✅ 完了 |
