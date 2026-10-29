import { PORTFOLIO_URL } from '@/lib/siteFooter';

/*
 * 反応の窓口。**3 サイトで 1 本（www）に集めている。**
 *
 * slides は静的な HTML でサーバを持たないし、同じ処理を 3 つに写すと
 * 直すたびに 3 回直すことになる。cookie は親ドメイン（.y4bu.net）に
 * 置いてあるので、どのサイトから叩いても同じ端末として届く。
 *
 * **credentials: 'include' が要る。** 別オリジンへの呼び出しなので、
 * 付けないとブラウザが cookie を外す（同じ登録ドメインでも同じ）。
 */

export type Kind = 'post' | 'work' | 'deck';

const urlOf = (kind: Kind, target: string) =>
  `${PORTFOLIO_URL}/api/reactions?kind=${kind}&target=${encodeURIComponent(target)}`;

export const sendReaction = (kind: Kind, target: string, action: 'like' | 'unlike' | 'view') =>
  fetch(urlOf(kind, target), {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action }),
  });

export const askLiked = (kind: Kind, target: string) =>
  fetch(urlOf(kind, target), { credentials: 'include' })
    .then((res) => res.json() as Promise<{ liked?: boolean }>)
    .then((data) => Boolean(data.liked));
