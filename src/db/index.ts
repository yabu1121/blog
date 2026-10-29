import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

/*
 * 開発中は dev サーバのホットリロードごとに接続が増えるので、
 * globalThis に 1 本だけ持たせて使い回す。portfolio と同じ作り。
 *
 * prepare: false は pooler（Supavisor）のトランザクションモードで必要。
 * prepared statement が接続をまたいで共有できないため。
 */
/*
 * **設定を変えたら作り直す。** 接続は globalThis に残して使い回すので、
 * この下の設定を直しても dev を再起動するまで古いプールのままになる。
 * 実際それで「timeout を入れたのに効かない」状態に一度はまった。
 * 版を上げれば次のホットリロードで作り直される。
 */
const SETTINGS_VERSION = 'v3-pool-size';

const globalForDb = globalThis as unknown as {
  _pg?: ReturnType<typeof postgres>;
  _pgVersion?: string;
};

if (globalForDb._pg && globalForDb._pgVersion !== SETTINGS_VERSION) {
  void globalForDb._pg.end({ timeout: 5 }).catch(() => {});
  globalForDb._pg = undefined;
}

const client =
  globalForDb._pg ??
  postgres(connectionString, {
    prepare: false,
    ssl: 'require',
    // pooler（Supavisor）を通しているので、アプリ側で束ねる意味はない。
    // サーバーレスは実行環境ごとに接続を持つため、1 環境あたりは小さくする。
    // admin は 1 ページで複数のクエリを並列に投げるので 3 は下限。
      // 1 ページで複数のクエリを同時に投げるので 3 では口が足りない。
      // pooler が束ねるので、こちらを増やしても DB の負担は変わらない。
    max: 10,
    /*
     * **timeout を必ず入れる。** pooler（Supavisor）は idle の接続を
     * 黙って切る。切られた socket がプールに残ると、次のクエリがそれを
     * 掴んで TCP のタイムアウトまで待ち続け、画面が返らなくなる
     * （admin が「生きているのに応答しない」状態になっていた原因）。
     *
     * idle_timeout ... 切られる前にこちらから閉じる
     * max_lifetime ... 長く生きた接続は作り直す
     * connect_timeout ... 繋がらないときは待たずに失敗させる
     */
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb._pg = client;
  globalForDb._pgVersion = SETTINGS_VERSION;
}

export const db = drizzle(client, { schema });
