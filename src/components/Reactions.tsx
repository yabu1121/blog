'use client';

import { useEffect, useRef, useState } from 'react';
import { useConsent } from '@/lib/consent-client';
import { askLiked, sendReaction } from '@/lib/reactions-client';

/*
 * 記事の反応。読み終わりに置く。
 *
 * **数は出さない。** 数えた結果を見るのは書いている本人だけ（admin）で、
 * 読む人に「3 いいね」と見せても、少ないと押しにくくなるだけで得が無い。
 * 出すのは「あなたは押したか」だけ。
 *
 * 閲覧も**読み込んだあとにここから数える。** 記事ページは 'use cache' で
 * 配っているので、描画の最中に数えるとキャッシュが使えなくなる。
 * 窓口は www に 1 本だけ置いていて、3 サイトから同じところを叩く。
 *
 * **同意が無ければ何もしない。** 押せはするが（押した手応えは返す）、
 * 数えないし cookie も置かない。断りを出しても読む人にできることは
 * 無いので、見た目は変えない。
 */

export const Reactions = ({ slug }: { slug: string }) => {
  const consent = useConsent();
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  // 開発中は effect が 2 回走る。数えるのは 1 回でいい
  const counted = useRef(false);

  useEffect(() => {
    if (consent !== 'yes' || counted.current) return;
    counted.current = true;

    /*
     * **閲覧を先に送ってから、押したかどうかを聞く。**
     * 端末の id（cookie）を配るのは数えるときなので、同時に投げると
     * 配られる前に聞きにいって「押していない」が返ることがある。
     *
     * 数えられなくても読むのには関係ないので、失敗は黙って捨てる。
     */
    void sendReaction('post', slug, 'view')
      .catch(() => {})
      .then(() => askLiked('post', slug))
      .then((already) => setLiked(already))
      .catch(() => {});
  }, [slug, consent]);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    const next = !liked;
    setLiked(next); // 先に見た目を変える。往復を待たせない
    if (consent !== 'yes') return setBusy(false); // 数えないだけ。手応えは返す
    try {
      await sendReaction('post', slug, next ? 'like' : 'unlike');
    } catch {
      setLiked(!next); // 通らなかったので戻す
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={liked}
      className={`inline-flex items-center gap-2 border px-4 py-2 font-mono text-[11px] tracking-wider transition-colors ${
        liked
          ? 'border-accent bg-accent-soft text-accent-ink'
          : 'border-line bg-bg text-ink-3 hover:border-accent hover:text-accent-ink'
      }`}
    >
      <span aria-hidden className="text-[13px] leading-none">
        {liked ? '♥' : '♡'}
      </span>
      {liked ? 'ありがとう' : 'よかった'}
    </button>
  );
};
