import {
  mysqlTable,
  int,
  varchar,
  text,
  timestamp,
  mysqlEnum,
} from 'drizzle-orm/mysql-core'

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  naam: varchar('naam', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})

export const vragenSets = mysqlTable('vragen_sets', {
  id: int('id').primaryKey().autoincrement(),
  label: varchar('label', { length: 200 }).notNull(),
  userId: int('user_id')
    .notNull()
    .references(() => users.id),
  shareToken: varchar('share_token', { length: 64 }).unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})

export const competentieEnum = mysqlEnum('competentie', [
  'KWALITEITEN',
  'MOTIEVEN',
  'WERK',
  'STURING',
  'NETWERKEN',
])

export const vragen = mysqlTable('vragen', {
  id: int('id').primaryKey().autoincrement(),
  vraagTekst: text('vraag_tekst').notNull(),
  competentie: competentieEnum.notNull(),
  tijdSeconden: int('tijd_seconden').notNull(), // 30, 60, 120
  vragenSetId: int('vragen_set_id')
    .notNull()
    .references(() => vragenSets.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})

export const geslotenVraagTypeEnum = mysqlEnum('type', [
  'WAAR_NIET_WAAR',
  'VIER_OPTIES',
])

export const geslotenVragen = mysqlTable('gesloten_vragen', {
  id: int('id').primaryKey().autoincrement(),
  vraagTekst: text('vraag_tekst').notNull(),
  type: geslotenVraagTypeEnum.notNull(),
  tijdSeconden: int('tijd_seconden').notNull(), // 30, 45, 60
  optieA: varchar('optie_a', { length: 500 }).notNull(),
  optieB: varchar('optie_b', { length: 500 }).notNull(),
  optieC: varchar('optie_c', { length: 500 }),
  optieD: varchar('optie_d', { length: 500 }),
  correctAntwoord: varchar('correct_antwoord', { length: 1 }).notNull(), // A, B, C, D
  vragenSetId: int('vragen_set_id')
    .notNull()
    .references(() => vragenSets.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})
