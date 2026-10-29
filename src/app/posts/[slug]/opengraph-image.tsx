import { getPublishedPost } from '@/lib/posts';
import { OG_SIZE, renderOg } from '@/app/og/render';

/*
 * 記事の OGP。表紙（coverImage）があるページでも、ここが返す 1 枚に揃える。
 * 表紙は縦横比がまちまちで、SNS の枠（1200x630）で切れ方が読めない。
 */

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = '記事';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  return renderOg({ title: post?.title ?? '記事が見つかりません' });
}
