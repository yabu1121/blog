import Link from 'next/link';
import { tagHref } from './TagList';

/*
 * 一覧の上に置くタグの絞り込み。
 *
 * **ページ遷移で絞る。** 記事は公開済みだけを DB から引いているので、
 * 全部を 1 枚に読み込んで JS で隠すより、/tags/<タグ> を開く方が素直。
 * slides（静的ビルドなので 1 枚に全部置いている）とは事情が違う。
 *
 * 現在地は空色で示す。ALL は一覧（/）に戻る。
 */

/** 現在地の芯。ヘッダーのナビと同じ示し方にしている */
const Bar = () => <span aria-hidden className="absolute -bottom-0.5 left-0 h-[2px] w-full bg-accent" />;

export const TagFilter = ({
  tags,
  current,
  total,
}: {
  tags: { tag: string; count: number }[];
  /** いま絞っているタグ。一覧では未指定 */
  current?: string;
  /** 全記事の数。ALL の横に出す */
  total: number;
}) => {
  if (!tags.length) return null;

  /*
   * **囲いは付けない。** 枠で囲うとタグの数だけ箱が並んで、一覧より
   * 目立ってしまう。現在地は色と下の芯だけで示す（ALL も同じ扱い）。
   */
  const chip =
    'relative flex items-center gap-1.5 py-1 font-mono text-[11px] tracking-wider transition-colors';
  const on = 'text-accent-ink';
  const off = 'text-ink-3 hover:text-accent-ink';

  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
      <li>
        <Link href="/" className={`${chip} ${current ? off : on}`}>
          ALL
          <span className="text-ink-3">{total}</span>
          {!current && <Bar />}
        </Link>
      </li>
      {tags.map(({ tag, count }) => {
        const active = current?.toLowerCase() === tag.toLowerCase();
        return (
          <li key={tag}>
            <Link href={tagHref(tag)} className={`${chip} ${active ? on : off}`}>
              {tag}
              <span className="text-ink-3">{count}</span>
              {active && <Bar />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
