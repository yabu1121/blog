/*
 * 読み込み中のハヤブサ。**ページごとに使い分ける。**
 *
 *   walk   ... 行き先へ歩いている。ページの移動・一覧の読み込み
 *   typing ... 打っている。保存・アップロード・下書きの処理
 *
 * 透過 GIF なので方眼の地がそのまま透ける。
 * **next/image は通さない。** 最適化を通すとアニメーションの
 * コマが落ちて 1 枚絵になる。
 */

export type LoadingPose = 'walk' | 'typing';
export type LoadingFacing = 'right' | 'left';

export const LoadingMascot = ({
  pose = 'walk',
  facing = 'right',
  width = 96,
  label,
  className = '',
}: {
  pose?: LoadingPose;
  facing?: LoadingFacing;
  /** 表示幅（px）。元は 160px */
  width?: number;
  /** 下に出す一言。読み上げにも使う */
  label?: string;
  className?: string;
}) => (
  <div className={`flex flex-col items-center gap-3 ${className}`} role="status" aria-live="polite">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={`/mascot/loading-${pose}-${facing}.gif`}
      alt=""
      width={width}
      height={width}
      className="h-auto"
      style={{ width }}
    />
    {label && <p className="font-mono text-[11px] tracking-wider text-ink-3">{label}</p>}
  </div>
);
