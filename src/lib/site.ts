/*
 * サイトの絶対 URL。OGP は相対パスを受け付けないので、どこかで決める必要がある。
 *
 * Vercel のプレビューは URL が毎回変わるので VERCEL_URL を見る。
 * 本番は NEXT_PUBLIC_SITE_URL（無ければ blog.y4bu.net）。
 */
export const siteUrl = (): string => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  if (process.env.VERCEL_ENV === 'production') return 'https://blog.y4bu.net';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3001';
};

export const SITE_NAME = 'blog | y4bu.net';
