import { revalidateTag } from 'next/cache';

/*
 * admin から叩かれて、記事のキャッシュを落とす。
 *
 * admin は別アプリなので revalidateTag が直接届かない。共有の secret で守った
 * この 1 本だけを窓口にする。**secret が未設定なら誰も通さない**（設定漏れで
 * 誰でもキャッシュを落とせる状態にしない）。
 */

/** 文字列長に依存しない比較。タイミング差で secret を推測されないようにする */
const safeEqual = (a: string, b: string) => {
  const encoder = new TextEncoder();
  const left = encoder.encode(a);
  const right = encoder.encode(b);

  let diff = left.length ^ right.length;
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }
  return diff === 0;
};

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    console.error('REVALIDATE_SECRET が未設定のため revalidate を受け付けません');
    return new Response('Not configured', { status: 503 });
  }

  const given = request.headers.get('x-revalidate-secret');
  if (!given || !safeEqual(given, secret)) {
    return new Response('Forbidden', { status: 403 });
  }

  /*
   * Next 16 の revalidateTag は第 2 引数で「失効までどれだけ古いものを出すか」を
   * 指定する。即時に落としたいので expire: 0。
   * （即時purge用の updateTag は Server Action 専用で、ここからは呼べない）
   */
  revalidateTag('posts', { expire: 0 });

  return Response.json({ revalidated: true });
}
