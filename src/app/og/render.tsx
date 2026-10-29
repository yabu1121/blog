import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/*
 * OGP 画像の組み立て。**3 サイトで同じ形にする。**
 *
 *   鳥（大きく左）  タイトル
 *                  hayato  y4bu.net
 *
 * 以前は左上に BLOG の文字を置いていたが、SNS に並んだときに読むのは
 * タイトルで、サイトの種別は要らなかった（水色が浮いてもいた）。
 *
 * **画像は data URI で埋める。** 外から取りに行くと、取得に失敗したときに
 * 鳥だけ欠けた板が配られる。
 *
 * 文字は Murecho を自前で読む。ImageResponse は next/font を使えず、
 * 渡さないと和文が豆腐になる。可変フォントも受け付けないので静的な weight。
 */

export const OG_SIZE = { width: 1200, height: 630 };

// 方眼。28px の薄い線と 140px の濃い線の二層。サイトの地と同じ約束
const GRID =
  'linear-gradient(#e8f3f9 1px, transparent 1px), linear-gradient(90deg, #e8f3f9 1px, transparent 1px),' +
  'linear-gradient(#f3f9fc 1px, transparent 1px), linear-gradient(90deg, #f3f9fc 1px, transparent 1px)';

export const renderOg = async ({ title }: { title: string }) => {
  const font = await readFile(join(process.cwd(), 'public/fonts/og-murecho-700.ttf')).catch(
    () => null,
  );
  const bird = await readFile(join(process.cwd(), 'public/mascot/og-pen.png'))
    .then((buf) => `data:image/png;base64,${buf.toString('base64')}`)
    .catch(() => null);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          /*
           * **真ん中にまとめる。** 左に寄せると、題が短いとき（「作品」
           * 「blog」など）に右の 4 割が空いて、板が欠けて見えた。
           */
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          backgroundImage: GRID,
          backgroundSize: '140px 140px, 140px 140px, 28px 28px, 28px 28px',
          padding: '0 88px',
          gap: 56,
        }}
      >
        {/* ImageResponse の中は satori が描くので next/image は使えない */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {bird && <img src={bird} width={300} height={300} alt="" />}

        {/* 長い題は折り返す。幅を決めないと鳥を押し出してしまう */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 620 }}>
          <div
            style={{
              display: 'flex',
              fontSize: title.length > 26 ? 58 : 72,
              fontWeight: 700,
              lineHeight: 1.25,
              color: '#16191d',
            }}
          >
            {title}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
            <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: '#4b5563' }}>
              hayato
            </div>
            <div style={{ display: 'flex', fontSize: 26, color: '#8b949e' }}>y4bu.net</div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: font
        ? [{ name: 'Murecho', data: font as unknown as ArrayBuffer, weight: 700, style: 'normal' }]
        : [],
    },
  );
};
