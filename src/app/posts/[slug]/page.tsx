import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { formatDate } from '@/lib/date';
import { getPublishedPost, toExcerpt } from '@/lib/posts';
import { SITE_NAME } from '@/lib/site';
import { Sidebar } from '@/components/Sidebar';
import { Mascot } from '@/components/Mascot';
import { markdownComponents } from '@/components/markdown';
import { GutterMascots } from '@/components/GutterMascots';
import { SiteFooter } from '@/components/SiteFooter';
import { TagList } from '@/components/TagList';
import { Reactions } from '@/components/Reactions';
import { CrumbLeaf } from '@/lib/crumb';

/*
 * cacheComponents 下で params をページ直下で読むには、ブロッキングを明示する。
 *
 * <Suspense> に逃がして外枠を先に返す形も試したが、ステータスを送った後に
 * notFound() が走るため **下書きや存在しない記事が 200 を返してしまう**。
 * 記事が無いことを 404 で返せないのは致命的なので、ここは最初の 1 バイトまで
 * 待つ方を選ぶ。getPublishedPost は 'use cache' なので待つのは初回だけ。
 */
export const instant = false;

export async function generateMetadata({ params }: PageProps<'/posts/[slug]'>) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  // 下書きや存在しない記事のタイトルは漏らさない
  if (!post) return { title: '記事が見つかりません' };

  const description = toExcerpt(post);

  /*
   * OGP。画像は opengraph-image.tsx が作る 1 枚に揃える（Next が自動で
   * og:image に差す）ので、ここでは指定しない。
   * **表紙があっても使わない。** 表紙は縦横比がまちまちで、SNS の枠
   * （1200x630）でどう切れるか読めないため。
   */
  return {
    title: post.title,
    description,
    openGraph: {
      type: 'article',
      /*
       * siteName は layout にも書いてあるが、ここにも要る。
       * **Next は openGraph を置き換える**（深くマージしない）ので、
       * ページ側で openGraph を書いた時点で layout の値は消える。
       */
      siteName: SITE_NAME,
      title: post.title,
      description,
      publishedTime: post.publishedAt?.toISOString(),
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: PageProps<'/posts/[slug]'>) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  // 下書きもここに落ちる。getPublishedPost が published = true で絞っているため
  if (!post) notFound();

  /*
   * 記事ページだけ 2 段組みにする。読み終えたあとの行き先（他の記事・検索・
   * 外のリンク）を同じ画面に置いておく。一覧と検索には出さない。
   * フッターは段組みの外に出して全幅で敷く。
   */
  return (
    <>
    {/* 帯のパンくずの末尾を slug から題に差し替える。画面には何も出さない */}
    <CrumbLeaf title={post.title} />

    <div className="grow relative mx-auto grid w-full max-w-5xl gap-10 px-5 pt-12 pb-28 lg:grid-cols-[1fr_15rem]">
      {/* 右は柱があるので、余白に置くのは左だけ */}
      <GutterMascots
        from="xl"
        items={[{ pose: 'writing', side: 'left', top: 80, width: 130 }]}
      />

      <main className="min-w-0">
      <Link
        href="/"
        className="font-mono text-xs text-ink-3 transition-colors hover:text-accent-ink"
      >
        ← 一覧
      </Link>

      <header className="mt-10 mb-12 border-b border-line pb-8">
        <time className="font-mono text-xs tabular-nums text-ink-3">
          {formatDate(post.publishedAt)}
        </time>
        <h1 className="mt-2 font-display text-[28px] leading-snug font-black tracking-tight">
          {post.title}
        </h1>

        {post.tags.length > 0 && (
          <div className="mt-4">
            <TagList tags={post.tags} size="md" />
          </div>
        )}

      </header>

        <div className="prose prose-neutral max-w-none">
          {/*
            remark-breaks を入れている。Markdown の素の仕様では単一の改行が
            無視されるが、書いた通りに改行されないのは直感に反する
            （はてなブログや Zenn も改行をそのまま出す）。
          */}
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents}>
            {post.body}
          </ReactMarkdown>
        </div>

        {/* 読み終わり。次へ行く前に 1 羽 */}
        <div className="mt-16 flex items-center gap-4 border-t border-line pt-8">
          <Mascot pose="written" width={120} className="h-auto w-20 shrink-0" />
          <p className="text-[13px] leading-relaxed text-ink-2">
            読んでくれてありがとうございます。
            <br />
            <Link href="/" className="font-mono text-[11px] text-ink-3 transition-colors hover:text-accent-ink">
              ほかの記事を見る →
            </Link>
          </p>
        </div>

        {/* 反応。閲覧を数えるのもここ（描画からは切り離す） */}
        <div className="mt-6">
          <Reactions slug={post.slug} />
        </div>
      </main>

      <Sidebar />
    </div>
    <SiteFooter />
    </>
  );
}
