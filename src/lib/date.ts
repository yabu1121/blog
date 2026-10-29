/*
 * 日付は時区を固定して組む。端末の時区に任せるとサーバとクライアントで
 * 文字列が食い違い、hydration が合わなくなる。
 */
const formatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const formatDate = (date: Date | null) => (date ? formatter.format(date).replace(/\//g, '.') : '');
