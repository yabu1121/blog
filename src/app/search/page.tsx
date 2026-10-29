import Link from 'next/link';
import { Mascot } from '@/components/Mascot';
import { formatDate } from '@/lib/date';
import { searchPosts, toExcerpt } from '@/lib/posts';
import { SiteFooter } from '@/components/SiteFooter';

/*
 * 検索結果。
 *
 * 検索語はリクエストごとに違うので、ページ単位でブロッキングにする
 * （cacheComponents 下では searchParams を読むページは明示が要る）。
 */
export const instant = false;

export async function generateMetadata({ searchParams }: PageProps<'/search'>) {
  const { q } = await searchParams;
  const keyword = typeof q === 'string' ? q : '';
  return { title: keyword ? `「${keyword}」の検索結果` : '検索' };
}

export default async function SearchPage({ searchParams }: PageProps<'/search'>) {
  const { q } = await searchParams;
  const keyword = typeof q === 'string' ? q.trim() : '';
  const results = keyword ? await searchPosts(keyword) : [];

  return (
    <>
    <main className="grow mx-auto w-full max-w-5xl px-5 pt-12 pb-28">
      <header className="pb-10">
        <p className="font-mono text-[11px] tracking-widest text-ink-3">SEARCH</p>
        <h1 className="mt-2 font-display text-3xl font-black tracking-tight">
          {keyword ? `「${keyword}」` : '検索'}
        </h1>
        {keyword && (
          <p className="mt-3 font-mono text-[11px] text-ink-3">
            <span className="text-accent-ink">{results.length}</span> 件
          </p>
        )}

        <form action="/search" className="mt-6 flex w-full max-w-xl">
          <input
            type="search"
            name="q"
            defaultValue={keyword}
            placeholder="記事を検索"
            aria-label="記事を検索"
            autoFocus={!keyword}
            className="min-w-0 flex-1 border border-line bg-bg px-4 py-2.5 text-[14px] outline-none transition-colors focus:border-accent"
          />
          <button
            type="submit"
            className="shrink-0 border border-l-0 border-line bg-bg px-5 font-mono text-[11px] tracking-wider text-ink-3 transition-colors hover:border-accent hover:text-accent-ink"
          >
            検索
          </button>
        </form>
      </header>

      {!keyword ? (
        <p className="text-sm text-ink-3">キーワードを入力して記事を探せます。</p>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center gap-4 border border-dashed border-line px-5 py-12">
          <Mascot pose="thinking" width={120} className="h-auto w-30" />
          <p className="text-sm text-ink-3">見つかりませんでした。</p>
        </div>
      ) : (
        <ul className="border-t border-line">
          {results.map((post) => (
            <li key={post.slug} className="border-b border-line">
              <Link
                href={`/posts/${post.slug}`}
                className="group relative grid grid-cols-[1fr_1.5rem] items-start gap-5 py-6"
              >
                <span className="flex min-w-0 items-start gap-5">
                  <span className="relative hidden aspect-video w-32 shrink-0 overflow-hidden border border-line transition-colors group-hover:border-accent sm:block">
                    {/* 表紙が無ければ記事ごとの生成 OGP を使う */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.coverImage || `/posts/${post.slug}/opengraph-image`}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 size-full object-cover"
                    />
                  </span>
                  <span className="min-w-0">
                    <time className="font-mono text-[11px] tabular-nums text-ink-3">
                      {formatDate(post.publishedAt)}
                    </time>
                    <span className="mt-0.5 block font-display text-[17px] leading-snug font-black transition-colors group-hover:text-accent-ink">
                      {post.title}
                    </span>
                    <span className="mt-1.5 line-clamp-2 block text-[13px] leading-relaxed text-ink-2">
                      {toExcerpt(post)}
                    </span>
                    {post.tags.length > 0 && (
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {post.tags.map((tag) => (
                          <span key={tag} className="font-mono text-[10px] tracking-wider text-ink-3">
                            {tag}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                </span>

                <span
                  aria-hidden
                  className="justify-self-end pt-0.5 text-ink-3 transition-[transform,color] duration-200 group-hover:translate-x-1 group-hover:text-accent-ink"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/"
        className="mt-10 inline-block font-mono text-[11px] text-ink-3 transition-colors hover:text-accent-ink"
      >
        ← 一覧
      </Link>
    </main>
    <SiteFooter />
    </>
  );
}
