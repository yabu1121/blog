import { pgTable, uuid, varchar, integer, text, boolean, timestamp } from 'drizzle-orm/pg-core';

/*
 * portfolio（public schema）の読み取り用の写し。
 *
 * **ここから書き込まない。** テーブルを作り替えるのは portfolio リポジトリの
 * drizzle/ 側だけ。blog は参加歴を出すために読むだけなので、必要な 2 つだけ写す。
 */

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  name: varchar('name').notNull(),
});

export const timeline = pgTable('timeline', {
  id: uuid('id').defaultRandom().primaryKey(),
  year: varchar('year', { length: 4 }).notNull(),
  month: integer('month').notNull(),
  endYear: varchar('end_year', { length: 4 }),
  endMonth: integer('end_month'),
  isOngoing: boolean('is_ongoing').default(false).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  detail: text('detail').notNull(),
  urls: text('urls').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
