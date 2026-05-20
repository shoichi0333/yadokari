# YADOKARI 本番化前チェックリスト

作成日: 2026-05-17

## 完遂基準

本番化前の安定化は、次を満たした状態を完了とする。

- 環境変数が未設定でも主要画面が壊れて見えない
- 外部サービス未設定時の fallback が明確である
- データファイル欠損時にページ全体が落ちない
- `npm run lint`, `npx tsc --noEmit`, `npm run build` が通る
- 残タスクが「本番設定作業」と「機能拡張」に分離されている

## 環境変数

### 必須

| 変数 | 用途 | 未設定時 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | canonical/外部URL生成 | `https://yadokari-minpaku.jp` 前提の箇所あり |

### DB・認証

| 変数 | 用途 | 未設定時 |
| --- | --- | --- |
| `DATABASE_URL` | Prisma/PostgreSQL | 物件は mock dataset fallback |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase client | 認証系は mock/local 挙動を確認 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client | 認証系は mock/local 挙動を確認 |

### 決済

| 変数 | 用途 | 未設定時 |
| --- | --- | --- |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Checkout 表示条件 | `/pricing` で準備中表示 |
| `STRIPE_SECRET_KEY` | Checkout Session 作成 | `/pricing` で準備中表示 |
| `STRIPE_STANDARD_PRICE_ID` | Standard plan | 該当ボタンを準備中表示 |
| `STRIPE_PRO_PRICE_ID` | Pro plan | 該当ボタンを準備中表示 |
| `STRIPE_WEBHOOK_SECRET` | Webhook 検証 | Webhook 本番反映不可 |

### メール

| 変数 | 用途 | 未設定時 |
| --- | --- | --- |
| `RESEND_API_KEY` | 問い合わせ・リード送信 | API は success を返し、fallback log を出す |
| `CONTACT_EMAIL` | 受信先 | API は success を返し、fallback log を出す |

## 本番投入前に必ず行うこと

1. Supabase project を作成し、`.env.local` と Vercel に環境変数を設定する
2. `npm run db:migrate` を実行する
3. `npm run db:seed` を実行し、初期物件データを登録する
4. Stripe product/price を作成し、price id を設定する
5. Stripe webhook endpoint を作成し、`STRIPE_WEBHOOK_SECRET` を設定する
6. Resend の送信ドメインを認証し、`RESEND_API_KEY` と `CONTACT_EMAIL` を設定する
7. `public/data/minpaku_listings.json` が存在し、`listings` 配列と緯度経度を持つことを確認する
8. `npm run lint`
9. `npx tsc --noEmit`
10. `npm run build`

## 今日固めた P0 項目

- `/pricing` は Stripe 未設定時に有料ボタンを無効化し、準備中状態を画面内に表示する
- `/api/contact` は Resend 未設定時に fallback log を残す
- `/api/leads` は Resend 未設定時または送信失敗時に fallback log を残す
- `/map` は `minpaku_listings.json` 欠損・破損時にページ全体を落とさず、エラー状態を表示する
- `/api/webhook/stripe` は Stripe/DB 未設定時に mock 応答し、未知の subscription イベントで 500 にならない

## 残タスク

### 本番設定

- Supabase/Prisma migration
- Stripe product/price/webhook 設定
- Resend domain 設定
- Vercel environment 設定

### 追加安定化

- Stripe webhook の DB 反映を実環境で疎通確認する
- Contact/Lead fallback log を DB 保存に切り替える
- sitemap の URL と実ルートの差分を定期チェックする
- 競合マップ JSON の schema validation を scraper 側にも追加する

### UX 改善

- `/properties` と `/search` の役割が初見で分かるよう、トップとナビの文言をさらに磨く
- モバイルのハンバーガーとボトムナビの役割を整理する
- ブログカードに画像を追加する
