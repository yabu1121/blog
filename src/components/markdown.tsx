import { Children, isValidElement } from "react";
import type { Components } from "react-markdown";

/*
 * slides の配信元。記事に貼られたスライドのリンクをカードに変えるのに使う。
 * 手元と本番でホストが違うので、ホストは見ずにパスの形だけで判断する。
 */
const SLIDES_URL = process.env.NEXT_PUBLIC_SLIDES_URL ?? "https://slides.y4bu.net";

/*
 * blog 自身の記事の URL か。/posts/<slug>。
 *
 * 絶対 URL（blog.y4bu.net/posts/...）でも相対（/posts/...）でも拾う。
 * 手元と本番でホストが違うので、ホストは見ずにパスの形で判断する。
 */
const postSlugOf = (href: string) => {
  const path = href.startsWith("/") ? href : href.replace(/^https?:\/\/[^/]+/, "");
  // 絶対 URL でホストを取り除けなかった（= 外のサイト）なら対象外
  if (!path.startsWith("/")) return undefined;
  const matched = /^\/posts\/([a-z0-9-]+)\/?$/.exec(path);
  return matched?.[1];
};

/** slides の「デッキ 1 本」の URL か。/<slug>/ の 1 階層だけ */
const deckSlugOf = (href: string) => {
  if (!href.startsWith(SLIDES_URL)) return undefined;
  const path = href.slice(SLIDES_URL.length);
  const matched = /^\/([a-z0-9-]+)\/?$/.exec(path);
  return matched?.[1];
};

/*
 * 記事の中のマスコット。
 *
 * 普通の画像として書く（Markdown のまま）が、alt を目印にして見た目を変える。
 *   ![mascot:left](...)      … 左に回り込み（既定の大きさ）
 *   ![mascot:right:lg](...)  … 右に回り込み、大きめ
 *   ![mascot](...)           … 回り込まず中央（古い記事のため残してある）
 *
 * **独自記法にしない。** 素の Markdown のままなので、他のビューアに持って
 * いっても画像として出るし、エディタのプレビューとも同じ扱いにできる。
 *
 * prose の画像スタイル（枠つき・幅いっぱい）が当たると困るので、
 * not-prose の中に入れて外す。
 */

const MASCOT_ALT = /^mascot(?::(left|right))?(?::(sm|md|lg))?$/;

/*
 * マスコットの大きさ。
 *
 * **画面幅ではなく本文幅に対する割合で決める。** sm: のような折り返しは
 * 画面の幅を見るので、admin のプレビューで枠を狭くしても縮まなかった
 * （スマホの枠で本文の 52% を占めていた）。割合なら枠に追従する。
 * 広い画面で大きくなりすぎないよう max- で頭を抑える。
 */
const WIDTHS = {
  sm: "w-[20%] max-w-20",
  md: "w-[28%] max-w-28",
  lg: "w-[36%] max-w-44",
} as const;

export type MascotSize = keyof typeof WIDTHS;

/*
 * マスコットだけの段落なら、その中のマスコットを返す。違えば undefined。
 *
 * **段落に閉じ込めると float が効かない。** 単独の行に書いたマスコットは
 * <p> に包まれるので、回り込みがその段落の中で終わってしまい、次の文章が
 * 横に来ない。マスコットだけの段落は <p> を外して、本文と同じ高さに置く。
 *
 * 2 枚以上でも外す（左右を続けて書いて向かい合わせにしたいとき）。
 * ただし **間の改行は捨てる。** remark-breaks を入れているので改行が <br>
 * として残り、それがあるだけで次の float が 1 行ぶん（28px）下がって
 * 段違いになる。
 */
const mascotsIn = (node: React.ReactNode) => {
  const items = Children.toArray(node).filter((child) =>
    typeof child === "string"
      ? child.trim() !== ""
      : !(isValidElement(child) && child.type === "br"),
  );
  const isMascotImage = (child: React.ReactNode) =>
    isValidElement<{ alt?: string }>(child) && MASCOT_ALT.test(child.props.alt ?? "");

  if (items.length === 0 || !items.every(isMascotImage)) return undefined;
  return items;
};

export const markdownComponents: Components = {
  p: ({ children, ...rest }) => {
    const mascots = mascotsIn(children);
    return mascots ? <>{mascots}</> : <p {...rest}>{children}</p>;
  },

  /*
   * スライドへのリンクは表紙つきのカードにする。
   *
   * **記法は足さない。** 普通のリンクを貼るだけでカードになるので、他の
   * ビューアに持っていっても壊れない（ただのリンクとして出る）。
   */
  a: ({ href, children, ...rest }) => {
    const slug = typeof href === "string" ? deckSlugOf(href) : undefined;
    const postSlug = typeof href === "string" ? postSlugOf(href) : undefined;

    // 自分の記事。表紙は持っていないので文字だけのカードにする
    if (postSlug) {
      return (
        <a
          href={`/posts/${postSlug}`}
          className="not-prose group my-4 flex items-center gap-3 border border-line bg-bg p-3.5 no-underline transition-[border-color,transform] duration-200 hover:-translate-y-[2px] hover:border-accent"
        >
          <span className="min-w-0 flex-1">
            <span className="block font-mono text-[10px] tracking-wider text-ink-3">POST</span>
            <span className="mt-0.5 block truncate font-display text-[14px] font-black text-ink group-hover:text-accent-ink">
              {children}
            </span>
            <span className="mt-0.5 block truncate font-mono text-[10px] text-ink-3">
              /posts/{postSlug}
            </span>
          </span>
          <span
            aria-hidden
            className="shrink-0 text-ink-3 transition-[transform,color] duration-200 group-hover:translate-x-1 group-hover:text-accent-ink"
          >
            →
          </span>
        </a>
      );
    }

    if (!slug) {
      return (
        <a href={href} {...rest}>
          {children}
        </a>
      );
    }

    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="not-prose group my-4 flex items-center gap-3 border border-line bg-bg p-2.5 no-underline transition-[border-color,transform] duration-200 hover:-translate-y-[2px] hover:border-accent"
      >
        <span className="relative block aspect-video w-28 shrink-0 overflow-hidden border border-line bg-surface sm:w-36">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${SLIDES_URL}/thumbs/${slug}.png`}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-contain"
          />
        </span>
        <span className="min-w-0">
          <span className="block font-mono text-[10px] tracking-wider text-ink-3">SLIDE</span>
          <span className="mt-0.5 block truncate font-display text-[14px] font-black text-ink group-hover:text-accent-ink">
            {children}
          </span>
          <span className="mt-0.5 block truncate font-mono text-[10px] text-ink-3">/{slug}/</span>
        </span>
      </a>
    );
  },

  img: ({ src, alt, ...rest }) => {
    const matched = MASCOT_ALT.exec(alt ?? "");

    if (!matched || typeof src !== "string") {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} {...rest} />;
    }

    const side = matched[1];
    const size = (matched[2] ?? "md") as MascotSize;

    /*
     * 回り込みの向きと、**同じ側の先行マスコットを避ける指定**。
     *
     * clear が無いと、段落ごとに右マスコットを置いたとき 2 枚目が 1 枚目の
     * 横に入ろうとして、入りきらない分だけ下にずれる。それが繰り返されて
     * 階段状に並ぶ。同じ側の float の下まで下げれば縦に揃う。
     * 反対側は避けないので、左右で向かい合わせにはできる。
     */
    const place =
      side === "left"
        ? "float-left clear-left mr-5 mb-2"
        : side === "right"
          ? "float-right clear-right ml-5 mb-2"
          : "mx-auto block";

    return (
      /*
        **幅は外側の箱に持たせる。** 画像側に割合を書くと、箱の幅が
        画像なりに決まる（inline-block の shrink-to-fit）ので、
        割合の基準が自分自身になって潰れる。
      */
      <span className={`not-prose my-2 inline-block ${WIDTHS[size]} ${place}`}>
        {/* 飾りなので読み上げには載せない */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" aria-hidden className="h-auto w-full" loading="lazy" />
      </span>
    );
  },
};
