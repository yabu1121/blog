import Link from 'next/link';
import { visibleSnsLinks, iconFor } from '@/lib/snsLinks';
import { SITES, FONTS, OFL_URL, COPYRIGHT_YEAR, PORTFOLIO_URL } from '@/lib/siteFooter';

/*
 * ページ末尾のフッター。portfolio / slides と同じものを置いている。
 *
 * 置いているもの:
 *   - 3 サイトの行き先（www / blog / slides）
 *   - 外部リンク（visibleSnsLinks。増減は snsLinks.ts を 1 行直すだけ）
 *   - 書体の表示。自前配布している woff2 は全部 SIL OFL 1.1 なので、
 *     名前とライセンスを出す。**これは義理ではなく条件**（OFL 2 項）。
 *     ライセンス本文の同梱は /licenses で受ける。
 *
 * 幅・余白・書体・行送りは portfolio と同じ。ページの本文幅とは揃えない
 * （一覧は max-w-2xl、記事は max-w-5xl とばらつくため、サイト共通の
 * フッターとして portfolio と同じ max-w-5xl で固定する）。
 */

const Label = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-mono text-[10px] tracking-widest text-ink-3">{children}</h2>
);

export const SiteFooter = () => (
  /*
   * font-geist と leading-normal は portfolio と同じ見た目にするため。
   *   - blog の本文書体（--font-sans）は Space Grotesk だが、portfolio は Geist
   *   - blog は body に line-height: 1.8 があり、そのままだと行が間延びする
   * どちらもフッターの中だけで打ち消す。
   *
   * bg-bg は方眼を覆うため。方眼は body の背景画像なので、ここに
   * 背景色を敷くとフッターだけ白無地になる（portfolio と同じ地）。
   */
  <footer className="mt-24 border-t border-line bg-bg font-geist leading-normal">
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-12">
      <div className="grid gap-10 sm:grid-cols-[1fr_auto_auto] sm:gap-14">
        {/* 誰の場所なのか。ここだけ字を大きくする */}
        <div className="max-w-xs">
          <p className="font-display text-xl font-bold tracking-tight">y4bu.net</p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
            作ったもの・書いたもの・話したものの置き場です。
          </p>
        </div>

        <nav>
          <Label>SITES</Label>
          <ul className="mt-3 grid gap-2">
            {SITES.map((site) => (
              <li key={site.label}>
                {/* 同じドメイン内（blog）は Link、他サイトは素の a */}
                {site.internal ? (
                  <Link href={site.href} className="text-[13px] hover:text-accent-ink">
                    {site.label}
                  </Link>
                ) : (
                  <a href={site.href} className="text-[13px] hover:text-accent-ink">
                    {site.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <nav>
          <Label>ELSEWHERE</Label>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-1">
            {visibleSnsLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="me noreferrer"
                  className="group flex items-center gap-2 text-[13px] hover:text-accent-ink"
                >
                  {/* simpleicons は SVG を返す。next/image の最適化は SVG を通せないので素の img。
                      13px の飾りなので LCP には関わらない */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={iconFor(link)}
                    alt=""
                    width={13}
                    height={13}
                    loading="lazy"
                    className="size-[13px] opacity-45 transition-opacity group-hover:opacity-100"
                  />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mt-12 flex flex-col gap-2 border-t border-line pt-5 font-mono text-[10px] leading-relaxed tracking-wide text-ink-3 sm:flex-row sm:items-baseline sm:justify-between">
        <p>© {COPYRIGHT_YEAR} hayato</p>
        <p>
          Fonts: {FONTS.join(' / ')} —{' '}
          <a href={OFL_URL} target="_blank" rel="noreferrer" className="underline hover:text-accent-ink">
            SIL Open Font License 1.1
          </a>
          {' · '}
          {/* 表記は 3 サイト分を portfolio の 1 枚にまとめている */}
          <a href={`${PORTFOLIO_URL}/licenses`} className="underline hover:text-accent-ink">
            ライセンス
          </a>
          {' · '}
          <a href={`${PORTFOLIO_URL}/privacy`} className="underline hover:text-accent-ink">
            cookie
          </a>
        </p>
      </div>
    </div>
  </footer>
);
