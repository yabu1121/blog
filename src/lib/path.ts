'use client';

import { usePathname } from 'next/navigation';

/*
 * いまのパス。**必ずここを通して読む。**
 *
 * 本番（Vercel）ではトップの描画で usePathname() が "/index" を返す
 * （出力が index.html に置かれ、関数にはその名前で入ってくる）。
 * ブラウザでは "/" なので、そのまま使うとサーバとクライアントで
 * 違うものを描いてしまい、React が木を丸ごと作り直す
 * （Minified React error #418）。帯のパンくずに「/ index」と出て、
 * トップだけ毎回ちらついて重くなっていた。
 *
 * 手元の next start では "/" のままなので、**ローカルでは再現しない。**
 */
export const useCurrentPath = () => {
  const pathname = usePathname();
  if (pathname === '/index') return '/';
  return pathname.endsWith('/index') ? pathname.slice(0, -'/index'.length) : pathname;
};
