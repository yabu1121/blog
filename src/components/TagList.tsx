import Link from 'next/link';

/*
 * タグの並び。一覧のカード・記事の冒頭・サイドバーで使う。
 *
 * タグは URL の一部になるので encodeURIComponent を通す。
 * 日本語や記号（C++ の + など）がそのまま入ると壊れる。
 */

export const tagHref = (tag: string) => `/tags/${encodeURIComponent(tag)}`;

export const TagList = ({
  tags,
  size = 'sm',
  counts,
}: {
  tags: string[];
  size?: 'sm' | 'md';
  /** タグごとの本数。渡すと「タグ 3」の形で出す */
  counts?: Record<string, number>;
}) => {
  if (!tags.length) return null;

  const text = size === 'md' ? 'text-[12px]' : 'text-[11px]';

  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={tagHref(tag)}
            className={`flex items-center gap-1.5 border border-line px-2 py-0.5 font-mono ${text} text-ink-2 transition-colors hover:border-accent hover:text-accent-ink`}
          >
            {tag}
            {counts?.[tag] !== undefined && <span className="text-ink-3">{counts[tag]}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
};
