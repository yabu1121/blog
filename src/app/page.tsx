import Link from 'next/link';
import { Mascot } from '@/components/Mascot';
import { GutterMascots } from '@/components/GutterMascots';
import { formatDate } from '@/lib/date';
import { listPublishedPosts, listTags, toExcerpt } from '@/lib/posts';
import { TagFilter } from '@/components/TagFilter';
import { SiteFooter } from '@/components/SiteFooter';

/*
 * 記事の一覧。
 *
 * **枠も地も置かない。** 絞り込みと同じで、罫 1 本と字だけで並べる。
 * 箱を並べると 1 件ずつが主張して、どこから読むか決まらない。
 * 区切りは行の下の罫だけにしている。
 */
export default async function Home() {
  const [items, tags] = await Promise.all([listPublishedPosts(), listTags()]);

  return (
    <>
    <main className="grow relative mx-auto w-full max-w-5xl px-5 pb-28">
      {/*
        本文の外側（左右の余白）に散らす。xl 未満では出ない。
        表題の横にも 1 羽いるので余白は 2 羽まで。
        **内容の高さに収めること。** はみ出すとフッターに乗る
        （実測で top:1120 の個体がフッターの著作権表示に被っていた）。
      */}
      <GutterMascots
        from="2xl"
        items={[{ pose: 'flying', side: 'right', top: 300, width: 110 }]}
      />

      <header className="relative pt-12 pb-14">
          {/* 表題の右に 1 つだけ。ここが「書く場所」だと分かるようにペンのポーズにする */}
          <span className="pointer-events-none absolute -top-1 right-0 hidden w-28 sm:block">
            <Mascot pose="writing" width={160} className="h-auto w-full" />
          </span>

          <h1 className="font-display text-5xl leading-none font-bold tracking-tight sm:text-6xl">
          blog
          <span className="mt-3 block text-[0.42em] font-black tracking-wider text-ink-2">
            書いたものの置き場
          </span>
        </h1>
      </header>

      {/*
        絞り込みと検索。**同じ行に並べる。** どちらも「読むものを選ぶ」
        道具なので、ヘッダーの引き出しに入れるより、一覧の上に出ている方が
        早い（引き出しは行き先を選ぶところにしておく）。
      */}
      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2">
        {tags.length > 0 && <TagFilter tags={tags} total={items.length} />}

        <form action="/search" className="flex w-full sm:ml-auto sm:w-80">
          <input
            type="search"
            name="q"
            placeholder="記事を検索"
            aria-label="記事を検索"
            className="min-w-0 flex-1 border border-line bg-bg px-3 py-2 text-[13px] outline-none transition-colors focus:border-accent"
          />
          <button
            type="submit"
            className="shrink-0 border border-l-0 border-line bg-bg px-4 font-mono text-[11px] tracking-wider text-ink-3 transition-colors hover:border-accent hover:text-accent-ink"
          >
            検索
          </button>
        </form>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <Mascot pose="thinking" width={120} className="h-auto w-30" />
          <p className="text-sm text-ink-3">まだ記事がありません。</p>
        </div>
      ) : (
        <ul className="border-t border-line">
          {items.map((post) => (
            <li key={post.slug} className="border-b border-line">
              <Link
                href={`/posts/${post.slug}`}
                className="group relative grid grid-cols-[1fr_1.5rem] items-start gap-5 py-6"
              >


                <span className="flex min-w-0 items-start gap-5">
                  {/* 表紙。枠を固定して中に収める（縦横比はまちまち） */}
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

                    {/*
                      タグはカードの中に置くが、**リンクにはしない**。
                      カード全体が <Link> なので a の入れ子になって踏めない。
                      絞り込みは上の帯から。
                    */}
                    {post.tags.length > 0 && (
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-[10px] tracking-wider text-ink-3"
                          >
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
    </main>
    <SiteFooter />
    </>
  );
}
