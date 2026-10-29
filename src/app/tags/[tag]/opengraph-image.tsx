import { OG_SIZE, renderOg } from '@/app/og/render';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'タグ';

export default async function Image({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  return renderOg({ title: decodeURIComponent(tag) });
}
