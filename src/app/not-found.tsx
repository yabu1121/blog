import Link from 'next/link';
import { Mascot } from '@/components/Mascot';

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 pb-28 pt-32">
      {/* 迷ったときの顔。考えているポーズ */}
      <Mascot pose="thinking" width={160} className="mb-6 h-auto w-40" />

      <p className="font-mono text-xs tracking-widest text-accent-ink">404</p>
      <h1 className="mt-3 font-display text-2xl font-black tracking-tight">
        記事が見つかりません
      </h1>
      <p className="mt-3 text-sm text-ink-2">
        URL が変わったか、まだ公開されていない記事かもしれません。
      </p>
      <Link
        href="/"
        className="mt-8 inline-block font-mono text-xs text-ink-3 transition-colors hover:text-accent-ink"
      >
        ← 一覧
      </Link>
    </main>
  );
}
