'use client'

import { useEffect, useSyncExternalStore } from 'react'

/*
 * パンくずの末尾に出す名前。
 *
 * **ページ側から渡す。** 帯（Header）はパスしか知らないので、
 * /posts/<slug> からは slug しか組めない。記事の題は中身を引いた
 * ページだけが知っているので、ここに置いて帯に拾わせる。
 *
 * **サーバでは空。** 作り置きしたページを配っているので、最初の描画は
 * どの記事でも同じ HTML でなければならない（違うと hydration が壊れる）。
 * 名前が出るのは画面が動き出してから。
 */

let leaf: string | null = null
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((listen) => listen());

const subscribe = (listen: () => void) => {
  listeners.add(listen)
  return () => {
    listeners.delete(listen)
  }
}

/** 帯の側で読む */
export const useCrumbLeaf = () =>
  useSyncExternalStore(
    subscribe,
    () => leaf,
    () => null,
  )

/** ページの中に置く。画面には何も出さない */
export const CrumbLeaf = ({ title }: { title: string }) => {
  useEffect(() => {
    leaf = title
    emit()
    return () => {
      leaf = null
      emit()
    }
  }, [title])

  return null
}
