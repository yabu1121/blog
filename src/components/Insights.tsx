'use client'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { useConsent } from '@/lib/consent-client'

/*
 * Vercel の計測を 2 つ。**扱いを分けてある。**
 *
 * Speed Insights ... 表示の速さ（Web Vitals）。送るのは経路と数値だけで、
 *   誰かを見分けるものは持たない。自分のサイトが遅いかどうかの話なので
 *   同意に関係なく出す。
 *
 * Web Analytics ... どのページが見られたか。cookie は使わないが、
 *   **訪問者を数える話なので同意を取ってから**にする。バナーで
 *   「ポートフォリオの改善以外には使わない」と言っている以上、
 *   返事をもらう前から数え始めない。
 *
 * どちらも自前の集計（site_views / request_log）とは別物。
 * あちらは管理画面で見る数で、こちらは Vercel 側の画面で見る。
 */
export const Insights = () => {
  const consent = useConsent()

  return (
    <>
      <SpeedInsights />
      {consent === 'yes' && <Analytics />}
    </>
  )
}
