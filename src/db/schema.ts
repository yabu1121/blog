import { pgSchema, uuid, varchar, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/*
 * **この定義は読み取り用。** テーブルを作り替えるのは admin リポジトリの
 * drizzle/ 側だけ。同じテーブルを 2 箇所から変更すると追えなくなる。
 * 列を足したらこちらにも同じ定義を写す（ずれれば列エラーで落ちるので気づける）。
 *
 * portfolio と同じ Supabase プロジェクトを共有し、schema で分けている。
 * portfolio 側が public、こちらが blog。drizzle.config.ts の schemaFilter も 'blog'。
 * 無料枠はプロジェクト数に上限があるので、サイトごとにプロジェクトを増やさない。
 */
export const blogSchema = pgSchema('blog');

export const posts = blogSchema.table(
  'posts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    // URL になる。/posts/<slug>
    slug: varchar('slug', { length: 120 }).notNull().unique(),
    title: varchar('title', { length: 255 }).notNull(),
    // 本文は Markdown のまま持つ。描画は react-markdown + remark-gfm
    body: text('body').notNull(),
    // 一覧に出す要約。空なら本文の先頭から作るので任意
    excerpt: text('excerpt'),
    // 表紙の画像。一覧のカードと記事の冒頭に出す
    coverImage: varchar('cover_image', { length: 255 }),
    /*
     * 公開フラグ。false の記事は一覧にも詳細にも出さない。
     * **既定は false。** 書きかけが公開される方が、公開し忘れるより事故が大きい。
     */
    published: boolean('published').default(false).notNull(),
    // 公開日。一覧の並び順に使う。公開するまでは null
    publishedAt: timestamp('published_at', { withTimezone: true }),
    /*
     * タグ。1 つの記事に何個でも付く。付けるのは admin。
     * マスタの表は持たない（自由入力なので、表に分けても得がない）。
     */
    tags: text('tags').array().notNull().default(sql`'{}'::text[]`),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // 一覧は「公開済みを新しい順」でしか引かない。その形に合わせた索引
    index('posts_published_published_at_idx').on(table.published, table.publishedAt),
    // タグ絞り込み（tags && '{...}'）用。配列の検索は GIN でないと全走査になる
    index('posts_tags_idx').using('gin', table.tags),
  ],
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
