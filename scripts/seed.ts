/*
 * 動作確認用の記事を入れる。公開 1 本と下書き 1 本。
 * 下書きが一覧にも詳細にも出ないことを、実データで確かめるために 2 本入れる。
 *
 *   npm run db:seed
 *
 * 消すときは Supabase の SQL エディタで:
 *   delete from blog.posts where slug in ('hello', 'draft-sample');
 */

import { db } from '../src/db';
import { posts } from '../src/db/schema';

const rows = [
  {
    slug: 'hello',
    title: 'はじめての記事',
    excerpt: '動作確認用の記事です。',
    body: [
      '## 見出し',
      '',
      'これは動作確認用の記事です。**太字**と `インラインコード`、それにリンク（[Next.js](https://nextjs.org)）が出るかを見ます。',
      '',
      '```ts',
      "const greet = (name: string) => `hello, ${name}`;",
      '```',
      '',
      '| 列 | 用途 |',
      '| --- | --- |',
      '| slug | URL |',
      '| published | 公開フラグ |',
      '',
      '- 箇条書き',
      '- remark-gfm が効いていれば表と打ち消し線も出る',
      '',
      '~~打ち消し~~',
    ].join('\n'),
    published: true,
    publishedAt: new Date(),
  },
  {
    slug: 'draft-sample',
    title: 'これは下書き',
    excerpt: null,
    body: '一覧に出ず、/posts/draft-sample を直接開いても 404 になるはず。',
    published: false,
    publishedAt: null,
  },
];

const main = async () => {
  const inserted = await db.insert(posts).values(rows).onConflictDoNothing({ target: posts.slug }).returning({
    slug: posts.slug,
    published: posts.published,
  });

  if (inserted.length === 0) {
    console.log('既に入っていました（slug が重複）');
  } else {
    for (const row of inserted) console.log(`入れました: ${row.slug}（published: ${row.published}）`);
  }

  process.exit(0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
