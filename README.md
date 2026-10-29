# blog

技術ブログ。https://blog.y4bu.net

## 構成の方針

公開ページと管理画面を**別のホストに分ける**。

```
blog.y4bu.net    公開ページだけ。Server Component から DB を直読み
admin.y4bu.net   記事の作成と編集。Cloudflare Access でホストごと保護
```

間に API を置かない。どちらも Next.js から Drizzle で DB を触るので、
tRPC も CORS も型共有の手当ても要らない。

管理画面を同じホストの `/admin` に置かないのは、書き込み用のパスが保護の外に
残りやすいため。ホストごと分ければその隙が生まれない。

## 技術スタック

| 領域 | 技術 |
| --- | --- |
| フレームワーク | Next.js (App Router) |
| DB / ORM | Supabase (PostgreSQL) + Drizzle ORM |
| 本文 | Markdown を DB に保存し、react-markdown + remark-gfm で描画 |
| スタイリング | Tailwind CSS |
| デプロイ | Vercel |

DB は portfolio と同じ Supabase プロジェクトを使い、schema `blog` で分離する。

**マイグレーションは admin リポジトリが持つ。** このリポジトリの
`src/db/schema.ts` は読み取り用の同じ定義で、`db:generate` / `db:migrate` は置かない。

## 開発

```sh
cp .env.example .env.local   # DATABASE_URL を入れる
npm install
npm run dev
```

## 進捗

- [x] プロジェクトの土台
- [x] 記事テーブルのスキーマ
- [ ] 公開ページ（一覧・詳細）
- [x] 管理画面（別アプリ: admin）
- [ ] Vercel + DNS + Cloudflare Access
