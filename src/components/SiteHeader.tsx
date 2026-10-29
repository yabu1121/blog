'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { NAV, SEGMENT_LABELS } from '@/lib/nav';
import { SITES } from '@/lib/siteFooter';
import { useCurrentPath } from '@/lib/path';
import { useCrumbLeaf } from '@/lib/crumb';

/*
 * 上の細い帯。4 つのアプリ（www / blog / slides / admin）で同じ形にしている。
 *
 *   [☰] blog  / 記事 / hello
 *
 * **行き先は引き出しに畳む。** 横に並べると、ページが増えるたびに帯が
 * 混んでいくし、サイトごとに並ぶ数が違うと「同じ帯」に見えない。
 * 帯に出すのは、いまどこにいるかだけにする。
 */

const otherSites = SITES.filter((site) => !site.internal);

/*
 * 現在地。**押して戻れるようにする。**
 *
 * 記事やタグから一覧へ戻る道が、看板（blog）を押すか戻るボタンしか
 * 無かった。手前の段はリンクにして、いまいる場所だけ文字にする。
 *
 * **記事一覧とタグ一覧のページは無い**（一覧はトップそのもの）ので、
 * その 2 つはトップへ繋ぐ。無いページへ飛ばさないよう、行き先は
 * ここに書いたものだけにする。
 */
const CRUMB_HREF: Record<string, string> = {
  posts: '/',
  tags: '/',
  search: '/search',
};

/** uuid は出さない。読めないし、押しても行き先が無い */
const isOpaqueId = (segment: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);

const crumbsOf = (pathname: string) => {
  const crumbs: { label: string; href?: string }[] = [];

  for (const segment of pathname.split('/').filter(Boolean)) {
    if (isOpaqueId(segment)) continue;
    const href = CRUMB_HREF[segment];
    crumbs.push({
      label: SEGMENT_LABELS[segment] ?? decodeURIComponent(segment),
      // いまいる場所は押せない
      href: href && href !== pathname ? href : undefined,
    });
  }

  return crumbs;
};

export const SiteHeader = () => {
  const pathname = useCurrentPath();
  const [open, setOpen] = useState(false);

  // Esc で閉じる。開いているときだけ耳を貸す
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  /*
   * 末尾はページから受け取った題にする。
   * 受け取ったときは、パスから組んだ「押せない段」（= slug そのもの）を
   * 落としてから足す。slug と題が二重に並ばないように。
   */
  const leaf = useCrumbLeaf();
  const crumbs = leaf
    ? [...crumbsOf(pathname).filter((crumb) => crumb.href), { label: leaf, href: undefined }]
    : crumbsOf(pathname);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      {/* 細い帯。slides の表紙の外周と同じ。色はサイトごとに変える */}
      <div className="h-1.5 w-full bg-[linear-gradient(90deg,var(--c-accent-soft),var(--c-accent),var(--c-accent-soft))]" />

      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-bg/90 px-4 py-2.5 backdrop-blur">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="メニューを開く"
          aria-expanded={open}
          className="flex size-8 items-center justify-center border border-line text-ink-2 transition-colors hover:border-accent hover:text-accent-ink"
        >
          <span aria-hidden className="relative block h-[9px] w-4">
            <span className="absolute inset-x-0 top-0 h-px bg-current" />
            <span className="absolute inset-x-0 top-1 h-px bg-current" />
            <span className="absolute inset-x-0 top-2 h-px bg-current" />
          </span>
        </button>

        <Link href="/" className="shrink-0 font-display text-[15px] font-bold tracking-tight">
          blog
        </Link>

        <nav aria-label="現在地" className="flex min-w-0 items-baseline gap-2 font-mono text-[11px] text-ink-3">
          {crumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="flex min-w-0 items-baseline gap-2">
              <span aria-hidden>/</span>
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="truncate text-ink-2 transition-colors hover:text-accent-ink"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="truncate text-ink-2">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </header>

      {/* 外を押しても閉じる */}
      {open && (
        <button
          type="button"
          aria-label="メニューを閉じる"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink/20"
        />
      )}

      {/*
        閉じているときは inert にする。画面の外に出しているだけなので、
        そうしないと Tab で見えないリンクに入ってしまう。
      */}
      <nav
        inert={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col overflow-y-auto border-r border-line bg-bg transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-5 pt-6 pb-5">
          <Link href="/" onClick={() => setOpen(false)} className="font-display text-xl font-bold tracking-tight">
            blog
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="メニューを閉じる"
            className="ml-auto flex size-9 items-center justify-center font-mono text-[15px] text-ink-3 transition-colors hover:text-accent-ink"
          >
            ✕
          </button>
        </div>

        <ul className="space-y-0.5 px-3">
          {/* いまは空。増えたらここに並ぶ */}
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 text-[14px] transition-colors ${
                  isActive(item.href)
                    ? 'bg-accent-soft font-black text-accent-ink'
                    : 'text-ink-2 hover:text-accent-ink'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* 区切ってから別のサイト。押した先でヘッダーの中身が変わる理由が分かるように */}
        <div className="mt-auto border-t border-line px-6 py-5">
          <p className="font-mono text-[10px] tracking-widest text-ink-3">OTHER SITES</p>
          <ul className="mt-2.5 space-y-1.5 font-mono text-[11px] tracking-wider text-ink-3">
            {otherSites.map((site) => (
              <li key={site.label}>
                <a href={site.href} className="transition-colors hover:text-accent-ink">
                  {site.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
};
