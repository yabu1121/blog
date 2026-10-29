// フッターに出す行き先と書体。portfolio / slides にも同じ内容を置いている
// （リポジトリが別なので共有できない。増やすときは 3 箇所）。

export type SiteLink = { label: string; href: string; internal?: boolean };

export const SITES: SiteLink[] = [
  { label: 'portfolio', href: 'https://www.y4bu.net' },
  { label: 'blog', href: '/', internal: true },
  { label: 'slides', href: 'https://slides.y4bu.net' },
];

/*
 * 自前で配っている書体。public/fonts の woff2 と next/font が吐くものの両方。
 * どれも SIL OFL 1.1 で、再配布には著作権表示とライセンス本文が要る。
 */
export const FONTS = ['Murecho', 'Space Grotesk', 'Geist', 'Geist Mono'];

export const OFL_URL = 'https://openfontlicense.org/open-font-license-official-text/';

/*
 * 著作権表示の年。**現在時刻を読んではいけない。**
 * cacheComponents が有効なので、プリレンダ中の時刻参照は Next が弾く。
 * 年が変わったらここを直す。
 */
export const COPYRIGHT_YEAR = 2026;

/** ライセンス表記は portfolio の 1 枚にまとめている */
export const PORTFOLIO_URL = process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? 'https://www.y4bu.net';
