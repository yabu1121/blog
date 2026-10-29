import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GutterMascots } from '@/components/GutterMascots';
import { Mascot } from '@/components/Mascot';
import { SiteFooter } from '@/components/SiteFooter';
import { TagFilter } from '@/components/TagFilter';
import { formatDate } from '@/lib/date';
import { listPostsByTag, listPublishedPosts, listTags, toExcerpt } from '@/lib/posts';

/*
 * タグで絞った記事の一覧。
 *
 * params をページ直下で読むのでブロッキングを明示する。Suspense に
 * 包むと HTTP 200 を先に返してしまい、notFound() が効かない（空の
 * タグを開いたときに 404 にできなくなる）。
 */
export const instant = false;

export const generateMetadata = async ({ params }: PageProps<'/tags/[tag]'>) => {
  const { tag } = await params;
  return { title: `${decodeURIComponent(tag)} の記事` };
};

export default async function TagPage({ params }: PageProps<'/tags/[tag]'>) {
  const { tag: raw } = await params;
  const tag = decodeURIComponent(raw);

  const [items, all, every] = await Promise.all([
    listPostsByTag(tag),
    listTags(),
    listPublishedPosts(),
  ]);

  // 1 本も無いタグは存在しない扱いにする。打ち間違いの URL で空の画面を出さない
  if (!items.length) notFound();

  // URL の表記ではなく、記事に実際に付いている表記を見出しに出す
  const label = items[0].tags.find((t) => t.toLowerCase() === tag.toLowerCase()) ?? tag;

  return (
    <>
      <main className="grow relative mx-auto w-full max-w-5xl px-5 pt-12 pb-28">
        <GutterMascots
          from="2xl"
          items={[{ pose: 'guide', side: 'left', top: 80, width: 110 }]}
        />

        <header>
          <p className="font-mono text-[11px] tracking-widest text-ink-3">TAG</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">{label}</h1>
          <p className="mt-2 font-mono text-[11px] text-ink-3">{items.length} 本の記事</p>
        </header>

        {/* 一覧と同じ帯。ここから他のタグへ直接移れる */}
        <div className="mt-8">
          <TagFilter tags={all} current={label} total={every.length} />
        </div>

        <ul className="mt-10 grid gap-10">
          {items.map((post) => (
            <li key={post.slug}>
              <Link href={`/posts/${post.slug}`} className="group flex items-start gap-5">
                <span className="relative hidden aspect-video w-36 shrink-0 overflow-hidden border border-line transition-colors group-hover:border-accent sm:block">
                  {/* 表紙が無ければ記事ごとの生成 OGP を使う */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImage || `/posts/${post.slug}/opengraph-image`}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[11px] text-ink-3">{formatDate(post.publishedAt)}</span>
                  <span className="mt-1 block font-display text-xl font-bold tracking-tight transition-colors group-hover:text-accent-ink">
                    {post.title}
                  </span>
                  <span className="mt-1.5 block text-[14px] leading-relaxed text-ink-2">{toExcerpt(post)}</span>
                </span>
              </Link>
              {post.tags.length > 0 && (
                <p className="mt-2.5 flex flex-wrap gap-1.5">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className="border border-line px-1.5 py-0.5 font-mono text-[10px] text-ink-3"
                    >
                      {t}
                    </span>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ul>

        {/* 行き止まりにしない。タグの行き来は上の帯でできる */}
        <p className="mt-16 border-t border-line pt-8 font-mono text-[11px]">
          <Link href="/" className="inline-flex items-center gap-2 text-ink-3 hover:text-accent-ink">
            <Mascot pose="wave" width={28} className="size-7" />
            すべての記事を見る →
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
