import { cacheLife, cacheTag } from 'next/cache';
import { and, desc, eq, ilike, isNotNull, lte, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import { posts } from '@/db/schema';

/*
 * 公開ページが DB を引くのはこのファイルだけ。
 *
 * **どの関数も「公開済みかつ公開日時が過ぎたもの」で絞る。**
 * 下書きは一覧に出ないだけでなく、URL を直接叩いても取れない（取れたら
 * 404 にできない）。予約公開も同じで、時刻が来るまでは取れない。
 *
 * 時刻の比較は DB の now() でやる。'use cache' の中で new Date() を使うと、
 * キャッシュを作った時刻で固定されてしまう。
 */
const isLive = () =>
  and(eq(posts.published, true), isNotNull(posts.publishedAt), lte(posts.publishedAt, sql`now()`));

/*
 * 'use cache' で結果を持つ。cacheComponents を有効にしているので、
 * 旧来の route segment config（export const revalidate）は使えない。
 * cacheTag を付けておくと、管理画面から revalidateTag('posts') で
 * 即時に反映できる（公開ボタンを押して 1 分待たなくて済む）。
 */
export const listPublishedPosts = async () => {
  'use cache';
  cacheLife('minutes');
  cacheTag('posts');

  return db
    .select({
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      coverImage: posts.coverImage,
      body: posts.body,
      publishedAt: posts.publishedAt,
      tags: posts.tags,
    })
    .from(posts)
    .where(isLive())
    .orderBy(desc(posts.publishedAt));
};

export const getPublishedPost = async (slug: string) => {
  'use cache';
  cacheLife('minutes');
  cacheTag('posts', `post:${slug}`);

  const [post] = await db
    .select()
    .from(posts)
    .where(and(isLive(), eq(posts.slug, slug)))
    .limit(1);

  return post;
};

/*
 * 一覧の要約。excerpt が空なら本文の先頭から作る。
 * Markdown の記号がそのまま出ると読めないので、ざっくり落とす。
 */
export const toExcerpt = (post: { excerpt: string | null; body: string }, length = 120) => {
  if (post.excerpt?.trim()) return post.excerpt.trim();

  const plain = post.body
    .replace(/```[\s\S]*?```/g, '') // コードブロック
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // 画像
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // リンクは文字だけ残す
    .replace(/^#{1,6}\s+/gm, '') // 見出しの #
    .replace(/[*_`>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return plain.length > length ? `${plain.slice(0, length)}…` : plain;
};

/*
 * 検索。タイトルと本文を部分一致で引く。
 *
 * 件数が少ないうちは ilike で足りる。全文検索（tsvector）は語の切り出しの
 * 設定が要るので、記事が増えて遅くなってから入れる。
 *
 * **キャッシュしない。** 検索語ごとにキャッシュを作っても当たらないし、
 * 書いた直後に出ないのも困る。
 */
export const searchPosts = async (query: string) => {
  const keyword = query.trim();
  if (!keyword) return [];

  // % と _ は ilike の記号なので、そのまま探せるように打ち消す
  const pattern = `%${keyword.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

  return db
    .select({
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      coverImage: posts.coverImage,
      body: posts.body,
      publishedAt: posts.publishedAt,
      tags: posts.tags,
    })
    .from(posts)
    .where(and(isLive(), or(ilike(posts.title, pattern), ilike(posts.body, pattern))))
    .orderBy(desc(posts.publishedAt))
    .limit(50);
};

/** サイドバーに出す最近の記事 */
export const listRecentPosts = async (limit = 5) => {
  'use cache';
  cacheLife('minutes');
  cacheTag('posts');

  return db
    .select({ slug: posts.slug, title: posts.title, publishedAt: posts.publishedAt })
    .from(posts)
    .where(isLive())
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
};

/*
 * タグの一覧と本数。サイドバーとタグ一覧ページに出す。
 *
 * マスタの表を持たないので unnest で数える。公開済みの記事だけを
 * 対象にする（下書きにしか付いていないタグを出すと、開いても空になる）。
 */
export const listTags = async () => {
  'use cache';
  cacheLife('minutes');
  cacheTag('posts');

  const rows = await db.execute<{ tag: string; count: number }>(
    sql`select unnest(tags) as tag, count(*)::int as count
        from blog.posts
        where published = true and published_at is not null and published_at <= now()
        group by 1
        order by count desc, tag asc`,
  );
  return rows.map((r) => ({ tag: r.tag, count: r.count }));
};

/*
 * あるタグが付いた公開済みの記事。
 *
 * 大文字小文字を無視して引く。admin 側では「DB」と「db」を同じタグとして
 * 弾いているが、先に付いていた方の表記が残るだけなので、URL から引くときも
 * 表記の違いで取りこぼさないようにする。
 */
export const listPostsByTag = async (tag: string) => {
  'use cache';
  cacheLife('minutes');
  cacheTag('posts');

  return db
    .select({
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      coverImage: posts.coverImage,
      body: posts.body,
      publishedAt: posts.publishedAt,
      tags: posts.tags,
    })
    .from(posts)
    .where(
      and(
        isLive(),
        sql`exists (select 1 from unnest(${posts.tags}) t where lower(t) = lower(${tag}))`,
      ),
    )
    .orderBy(desc(posts.publishedAt));
};
