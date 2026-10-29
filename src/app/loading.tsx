import { LoadingMascot } from '@/components/LoadingMascot';

/*
 * ページ移動の待ち。
 *
 * **ここは「歩いている」。** 読みに来ている場所なので、
 * 書き込みを待たせる admin（打っている）と描き分ける。
 */
export default function Loading() {
  return (
    <main className="grow flex min-h-[60vh] items-center justify-center px-5">
      <LoadingMascot pose="walk" width={110} label="LOADING" />
    </main>
  );
}
