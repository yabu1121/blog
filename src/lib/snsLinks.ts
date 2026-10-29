// SNS/外部リンク。portfolio の src/app/utils/snsLinks.ts と同じ内容
// （リポジトリが別なので共有できない。増やすときは portfolio / blog / slides の 3 箇所）。

export type SnsLink = {
  label: string; // サービス名
  href: string; // リンク先
  slug?: string; // simpleicons のスラッグ（あれば）
  icon?: string; // 自前アイコン
  hidden?: boolean; // 画面に出さない。URL は残しておきたいので消さずに伏せる
};

export const snsLinks: SnsLink[] = [
  { label: 'X (Twitter)', href: 'https://x.com/papox_57', slug: 'x' },
  { label: 'GitHub', href: 'https://github.com/yabu1121', slug: 'github' },
  { label: 'Zenn', href: 'https://zenn.dev/yabu_p', slug: 'zenn' },
  { label: 'Speaker Deck', href: 'https://speakerdeck.com/hayato_1121', slug: 'speakerdeck', hidden: true },
  // simpleicons から LinkedIn は消えている（cdn.simpleicons.org/linkedin は 404）。
  // portfolio から持ってきた SVG を public/logos に置いて使う
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hayato-nasu-4aa1ba411', icon: '/logos/linkedin.svg', hidden: true },
  { label: 'Instagram', href: 'https://www.instagram.com/squ1_nh', slug: 'instagram' },
  { label: 'Wantedly', href: 'https://www.wantedly.com/id/hayato_nasu_c', slug: 'wantedly', hidden: true },
];

/*
 * 実際に画面に出すもの。伏せたいものは snsLinks 側に hidden を付ける
 * （配列から消すと URL ごと失うので、戻せるように残しておく）。
 */
export const visibleSnsLinks = snsLinks.filter((l) => !l.hidden);

export const iconFor = (l: SnsLink): string =>
  l.slug ? `https://cdn.simpleicons.org/${l.slug}` : (l.icon ?? '');
