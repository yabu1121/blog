'use client';

import { useSyncExternalStore } from 'react';

/*
 * 同意の読み書き（画面側）。
 *
 * **サーバで分岐しない。** 記事ページは 'use cache' で配っているので、
 * 「バナーを出すかどうか」をサーバで混ぜるとキャッシュが使えなくなる。
 * cookie は httpOnly にせず、出す・出さないはブラウザで決める。
 */

export const CONSENT_COOKIE = 'y4bu_consent';
export type Consent = 'yes' | 'no' | null;

/** 変わったことを同じ画面の中に知らせる。読み込み直さずにボタンを出すため */
const CHANGED = 'y4bu:consent';

export const readConsent = (): Consent => {
  if (typeof document === 'undefined') return null;
  const found = document.cookie
    .split('; ')
    .find((pair) => pair.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1);

  return found === 'yes' || found === 'no' ? found : null;
};

/*
 * **親ドメインに置く。** www / blog / slides で 1 つの返事を共有するため。
 * 手元（localhost）では付けない — 付けると合わず、まったく置かれなくなる。
 */
const DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;

export const writeConsent = (value: 'yes' | 'no') => {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  const domain = DOMAIN ? `; Domain=${DOMAIN}` : '';
  // 半年。返事そのものは同意が要らない（「要らない」を覚えるためのもの）
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax${domain}${secure}`;
  window.dispatchEvent(new CustomEvent(CHANGED));
};

const subscribe = (listener: () => void) => {
  window.addEventListener(CHANGED, listener);
  return () => window.removeEventListener(CHANGED, listener);
};

/*
 * cookie は React の外にある値なので useSyncExternalStore で受ける。
 * effect の中で setState すると描き直しが連鎖するし、lint にも止められる。
 *
 * サーバ側の値は 'no'。**最初は何も出さない**ということ。描いたあとに
 * バナーが差し込まれる形になるが、逆（出てから消える）よりましで、
 * サーバには cookie の有無が分からない以上どちらかしかない。
 */
export const useConsent = (): Consent =>
  useSyncExternalStore(subscribe, readConsent, () => 'no' as Consent);
