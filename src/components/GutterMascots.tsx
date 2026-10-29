import { Mascot, type Facing, type Pose } from "./Mascot";

/*
 * 本文の外側（左右の余白）に置くマスコット。
 *
 * 本文の中に入れると読む流れを切るので、**コンテンツ幅の外**に出す。
 * 余白が足りない画面では出さない。重ねて本文を隠さないようクリックも拾わない。
 *
 * **向きは既定で内側（本文の方）を向く。** 左の余白の子は右を向き、右の余白の
 * 子は左を向く。外を向くと視線が本文から逃げる。
 *
 * 置く側は relative な箱で包むこと。top は箱の上からの px。
 */

export type GutterItem = {
  pose: Pose;
  side: "left" | "right";
  /** 箱の上からの位置（px） */
  top: number;
  /** 表示幅（px） */
  width?: number;
  /** 向きを変えたいとき。既定は内側 */
  facing?: Facing;
};

/*
 * どの幅から出すか。**クラスは丸ごと書く。**
 * Tailwind はソースを文字列として読むので、"2xl:" + "block" のように
 * 組み立てると気づかれず、そのクラスの CSS が生成されない。
 */
const SHOW_FROM = {
  lg: 'lg:block',
  xl: 'xl:block',
  '2xl': '2xl:block',
} as const;

export const GutterMascots = ({
  items,
  from = "lg",
}: {
  items: GutterItem[];
  /**
   * これ以上の幅で出す。本文が広いページほど大きくする。
   * 面の幅 + マスコットの幅 + ml-6 がここの幅に収まるか確かめること。
   * 収まらないと欠けて見える。
   */
  from?: "lg" | "xl" | "2xl";
}) => (
  <div
    aria-hidden
    className={`pointer-events-none absolute inset-0 hidden ${SHOW_FROM[from]}`}
  >
    {items.map((item, i) => (
      <span
        key={`${item.pose}-${i}`}
        style={{ top: item.top, width: item.width ?? 120 }}
        className={`absolute ${item.side === "left" ? "right-full mr-6" : "left-full ml-6"}`}
      >
        <Mascot
          pose={item.pose}
          facing={item.facing ?? (item.side === "left" ? "right" : "left")}
          width={item.width ?? 120}
          className="h-auto"
        />
      </span>
    ))}
  </div>
);
