'use client';

import { PORTFOLIO_URL } from '@/lib/siteFooter';
import { useConsent, writeConsent } from '@/lib/consent-client';

/*
 * Cookie の同意。
 *
 * **返事をするまで何も置かない。** 置いているのは閲覧と「よかった」を
 * 二重に数えないための 1 つだけで、広告にも外部にも渡さないが、
 * それを本人が知らないうちに置くのは筋が違う。
 *
 * cookie は親ドメインに置いているので、**返事は 3 サイトで 1 回で済む。**
 *
 * 出すかどうかはブラウザで決める（サーバで分岐すると記事ページを
 * キャッシュできなくなる）。描き始めは null で、読んでから出す。
 * **最初から出さない。** 画面が描かれたあとに差し込むと、読み始めの
 * 1 行目で動くので目障りになる。
 */
export const ConsentBanner = () => {
  const consent = useConsent();

  if (consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="cookie の利用について"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-bg/95 px-5 py-4 backdrop-blur"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <p className="text-[13px] leading-relaxed text-ink-2">
          当サイト（www / blog / slides）では、閲覧数と「よかった」の集計のために Cookie
          を使用します。取得した情報は<strong className="font-normal text-ink">
            本サイトの改善のみに利用し
          </strong>
          、広告配信や第三者への提供は行いません。
          {/* 説明は 3 サイトぶんを portfolio の 1 枚にまとめている */}
          <a
            href={`${PORTFOLIO_URL}/privacy`}
            className="ml-2 font-mono text-[11px] text-ink-3 underline transition-colors hover:text-accent-ink"
          >
            詳細
          </a>
        </p>

        <div className="flex shrink-0 gap-2 sm:ml-auto">
          <button
            type="button"
            onClick={() => writeConsent('no')}
            className="border border-line bg-bg px-4 py-2 font-mono text-[11px] tracking-wider text-ink-3 transition-colors hover:border-accent hover:text-accent-ink"
          >
            同意しない
          </button>
          <button
            type="button"
            onClick={() => writeConsent('yes')}
            className="border border-accent bg-accent-soft px-4 py-2 font-mono text-[11px] tracking-wider text-accent-ink transition-opacity hover:opacity-85"
          >
            同意する
          </button>
        </div>
      </div>
    </div>
  );
};
