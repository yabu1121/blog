import Image from "next/image";

/*
 * マスコットのハヤブサ。ポーズと向きを名前で呼ぶ。
 *
 * **左向きは CSS の反転ではなく専用の絵を使う**（文字や小物が反転しないため）。
 * 飾りなので読み上げには載せない（alt は空・aria-hidden）。
 * 元絵は 1254〜1774px あるので、webp に落としたものを public/mascot に置いている。
 */

const ART = {
  wave: { right: "pose-neutral-wave", left: "pose-neutral-wave-left", w: 1330, h: 1182 },
  flying: { right: "pose-flying", left: "pose-flying-left", w: 1254, h: 1254 },
  thinking: { right: "pose-thinking", left: "pose-thinking-left", w: 1254, h: 1254 },
  coding: { right: "pose-coding", left: "pose-coding-left", w: 1254, h: 1254 },
  celebrate: { right: "pose-celebrate", left: "pose-celebrate-left", w: 1254, h: 1254 },
  guide: { right: "pose-guide-right", left: "pose-guide-left", w: 1774, h: 887 },
  // 感情。記事の中に差し込むときに使う
  joy: { right: "emotion-joy-right", left: "emotion-joy-left", w: 1330, h: 1182 },
  fun: { right: "emotion-fun-right", left: "emotion-fun-left", w: 1330, h: 1182 },
  anger: { right: "emotion-anger-right", left: "emotion-anger-left", w: 1330, h: 1182 },
  sadness: { right: "emotion-sadness-right", left: "emotion-sadness-left", w: 1330, h: 1182 },
  // ブログ用。でかいペンを使う 4 コマ。記事を書く場所の絵として足した
  writing: { right: "pen-writing-hard-right", left: "pen-writing-hard-left", w: 480, h: 480 },
  written: { right: "pen-finished-proud-right", left: "pen-finished-proud-left", w: 480, h: 480 },
  heavy: { right: "pen-too-heavy-right", left: "pen-too-heavy-left", w: 480, h: 480 },
  carrying: { right: "pen-carrying-wobble-right", left: "pen-carrying-wobble-left", w: 480, h: 480 },
  avatar: { right: "avatar-128", left: "avatar-left-128", w: 128, h: 128 },
} as const;

export type Pose = keyof typeof ART;
export type Facing = "left" | "right";

/** 一覧や選択肢に出すときの名前 */
export const POSE_LABELS: Record<Pose, string> = {
  wave: "手を振る",
  flying: "飛ぶ",
  thinking: "考える",
  coding: "コーディング",
  celebrate: "祝う",
  guide: "指し示す",
  joy: "うれしい",
  fun: "たのしい",
  anger: "怒る",
  sadness: "悲しい",
  writing: "書いている",
  written: "書き上げた",
  heavy: "ペンが重い",
  carrying: "ペンを運ぶ",
  avatar: "顔",
};

export const POSES = Object.keys(ART) as Pose[];

export const mascotSrc = (pose: Pose, facing: Facing = "right") => `/mascot/${ART[pose][facing]}.webp`;

export const Mascot = ({
  pose,
  facing = "right",
  width,
  className = "",
  priority = false,
}: {
  pose: Pose;
  facing?: Facing;
  /** 表示幅（px）。高さは縦横比から決まる */
  width: number;
  className?: string;
  priority?: boolean;
}) => {
  const art = ART[pose];

  return (
    <Image
      src={mascotSrc(pose, facing)}
      alt=""
      aria-hidden
      width={width}
      height={Math.round((width * art.h) / art.w)}
      priority={priority}
      className={`pointer-events-none select-none ${className}`}
    />
  );
};
