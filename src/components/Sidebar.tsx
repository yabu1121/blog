import Link from 'next/link';
import { Mascot } from '@/components/Mascot';
import { formatDate } from '@/lib/date';
import { listRecentPosts, listTags } from '@/lib/posts';
import { TagList } from '@/components/TagList';

/*
 * 記事の横に出す柱。検索・最近の記事・外のリンク。
 *
 * 地（方眼紙）は変えない。柱だけを白い面にして、本文と区別がつくようにしている。
 * 狭い画面では本文の下に回る。
 */

const LINKS = [
  { label: 'portfolio', href: 'https://www.y4bu.net' },
  { label: 'slides', href: 'https://slides.y4bu.net' },
  { label: 'GitHub', href: 'https://github.com/yabu1121' },
  { label: 'X', href: 'https://x.com/papox_57' },
  { label: 'Zenn', href: 'https://zenn.dev/yabu_p' },
];

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="border border-line bg-bg p-4">
    <h2 className="font-mono text-[10px] tracking-widest text-ink-3">{title}</h2>
    <div className="mt-3">{children}</div>
  </section>
);

export const Sidebar = async () => {
  // portfolio（public schema）から参加歴も引く。同じ Supabase なので読むだけ
  const [recent, tags] = await Promise.all([listRecentPosts(), listTags()]);

  return (
    <aside className="grid gap-3.5 lg:sticky lg:top-20 lg:self-start">
      {/* 誰が書いているかを最初に出す。初めて来た人はここを見る */}
      <section className="border border-line bg-bg p-4">
        <div className="flex items-center gap-3">
          {/* マスコット（ハヤブサ）。透過 webp なので地の方眼がそのまま透ける */}
          <Mascot pose="avatar" width={56} className="size-14 shrink-0" />
          <div className="min-w-0">
            <p className="font-display text-xl font-bold tracking-tight">hayato</p>
            <p className="mt-0.5 font-mono text-[10px] tracking-widest text-ink-3">BACKEND ENGINEER</p>
          </div>
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-ink-2">
          芝浦工業大学 情報工学コース。バックエンドが好きで、計測して数値で語る
          パフォーマンス改善や DB 設計の作り込みを面白がっています。
          月に一本のデプロイを目標に、個人開発と長期インターンを並行中。
        </p>

        <p className="mt-3 font-mono text-[11px]">
          <a
            href="https://www.y4bu.net/about"
            target="_blank"
            rel="noreferrer"
            className="text-ink-3 transition-colors hover:text-accent-ink"
          >
            経歴とスキル ↗
          </a>
        </p>
      </section>

      <Panel title="SEARCH">
        {/* GET にして、結果の URL をそのまま共有・再読み込みできるようにする */}
        <form action="/search" className="flex">
          <input
            type="search"
            name="q"
            placeholder="記事を探す"
            aria-label="記事を検索"
            className="min-w-0 flex-1 border border-line bg-bg px-2.5 py-1.5 text-[13px] outline-none transition-colors focus:border-accent"
          />
          <button
            type="submit"
            className="shrink-0 border border-l-0 border-line bg-bg px-3 font-mono text-[11px] text-ink-3 transition-colors hover:border-accent hover:text-accent-ink"
          >
            →
          </button>
        </form>
      </Panel>

      {tags.length > 0 && (
        <Panel title="TAGS">
          <TagList
            tags={tags.map((t) => t.tag)}
            counts={Object.fromEntries(tags.map((t) => [t.tag, t.count]))}
          />
        </Panel>
      )}

      <Panel title="RECENT">
        {recent.length === 0 ? (
          <p className="font-mono text-[11px] text-ink-3">まだありません</p>
        ) : (
          <ul className="grid gap-2.5">
            {recent.map((post) => (
              <li key={post.slug}>
                <Link href={`/posts/${post.slug}`} className="group block">
                  <time className="font-mono text-[10px] tabular-nums text-ink-3">
                    {formatDate(post.publishedAt)}
                  </time>
                  <span className="mt-0.5 block text-[13px] leading-snug text-ink-2 group-hover:text-accent-ink">
                    {post.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="LINKS">
        <ul className="grid gap-1.5">
          {LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] text-ink-2 transition-colors hover:text-accent-ink"
              >
                {link.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </Panel>
    </aside>
  );
};
