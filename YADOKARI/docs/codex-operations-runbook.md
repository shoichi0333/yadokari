# Codex 運用ランブック

作成日: 2026-05-17

## 運用方針

YADOKARI は、デプロイ後の改善・保守・監視・ドキュメント更新を Codex が継続的に担当する前提で運用する。

Codex は単発のコード修正者ではなく、プロダクトの技術運用担当として振る舞う。

## Codex が毎回確認すること

1. `git status --short`
2. ユーザー作業や生成済み変更を巻き戻さない
3. 変更前に関連ファイルを読む
4. 変更後に以下を実行する

```powershell
cd YADOKARI\yadokari-app
npm run lint
npx tsc --noEmit
npm run build
```

## 本番運用タスク

### 毎日または作業時

- Vercel build status を確認
- 直近の API error を確認
- 問い合わせ fallback log が出ていないか確認
- Stripe webhook の失敗がないか確認

### 毎週

- 競合マップデータ件数を確認
- sitemap と実装ルートの差分を確認
- 問い合わせ・リード件数を確認
- 検索/チェック導線の離脱ポイントを改善する

### 毎月

- scraper の GitHub Actions 実行結果を確認
- `public/data/minpaku_listings.json` の件数差分を確認
- 料金プラン・有料機能の訴求を見直す
- docs を現状に合わせて更新する

## 障害時の初動

### build が落ちる

1. `npm run lint`
2. `npx tsc --noEmit`
3. `npm run build`
4. Prisma DLL の `EPERM` なら dev server を止めて再実行

### 問い合わせが届かない

1. `RESEND_API_KEY` を確認
2. `CONTACT_EMAIL` を確認
3. API fallback log を確認
4. 次の改善として DB 保存に切り替える

### 決済ができない

1. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
2. `STRIPE_SECRET_KEY`
3. `STRIPE_STANDARD_PRICE_ID`
4. `STRIPE_PRO_PRICE_ID`
5. `STRIPE_WEBHOOK_SECRET`
6. Stripe webhook event logs

### マップが表示されない

1. `public/data/minpaku_listings.json` の存在確認
2. JSON parse 確認
3. `listings` 配列と `lat/lng` の有無確認
4. scraper 出力を再生成

## Codex が優先する改善順

1. 本番で壊れて見える箇所の修正
2. 課金理由が明確になる機能
3. リード獲得に直結する導線
4. DB/Stripe/Resend など運用の堅牢化
5. SEO記事・エリアページの拡張

## 現在の重点テーマ

- 可否チェッカーの結果を「次に何をすべきか」まで導く
- 詳細レポートを有料プランの中核機能にする
- Codex が継続運用しやすいよう、変更と同時に docs を更新する
