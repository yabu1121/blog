import { OG_SIZE, renderOg } from '@/app/og/render';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = '記事を探す';

/* 組み立ては src/app/og/render.tsx に 1 つだけ置いてある */
export default function Image() {
  return renderOg({ title: '記事を探す' });
}
