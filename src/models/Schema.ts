import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the next database interaction,
// so there's no need to run it manually or restart the Next.js server.

// Enums
export const sexEnum = pgEnum('sex', ['male', 'female', 'other']);
export const sourceEnum = pgEnum('source', ['user', 'community']);
export const shareStatusEnum = pgEnum('share_status', ['private', 'public']);
export const sourceTypeEnum = pgEnum('source_type', ['document', 'note', 'snippet']);
export const themeEnum = pgEnum('theme', ['light', 'dark', 'system']);

// User profiles table
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  organization: varchar('organization', { length: 255 }),
  role: varchar('role', { length: 255 }),
  preferences: jsonb('preferences').notNull().default({
    defaultDocumentIds: [],
    favoriteDocumentIds: [],
    theme: 'system',
  }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => ({
  clerkUserIdIdx: index('clerk_user_id_idx').on(table.clerkUserId),
}));

// Patients table
export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  sex: text('sex').notNull(),
  context: text('context'),
  dischargeText: text('discharge_text'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Documents table
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => userProfiles.id, { onDelete: 'set null' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  summary: text('summary').notNull(),
  source: sourceEnum('source').notNull(),
  shareStatus: shareStatusEnum('share_status').notNull().default('private'),
  uploadedBy: varchar('uploaded_by', { length: 255 }).notNull(),
  s3Url: text('s3_url').notNull(),
  metadata: jsonb('metadata'),
  tags: jsonb('tags').notNull().default([]),
  uploadedAt: timestamp('uploaded_at', { mode: 'date' }).defaultNow().notNull(),
}, table => ({
  userIdIdx: index('document_user_id_idx').on(table.userId),
  sourceIdx: index('document_source_idx').on(table.source),
  shareStatusIdx: index('document_share_status_idx').on(table.shareStatus),
}));

// Document chunks table for vector search
export const documentChunks = pgTable('document_chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  chunkIndex: integer('chunk_index').notNull(),
  textChunk: text('text_chunk').notNull(),
  pageNumber: integer('page_number').notNull(),
  embedding: jsonb('embedding').notNull(), // Store as JSONB array for now
  metadata: jsonb('metadata'),
}, table => ({
  documentIdIdx: index('chunk_document_id_idx').on(table.documentId),
}));

// Snippets table
export const snippets = pgTable('snippets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  shortcut: varchar('shortcut', { length: 50 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => ({
  userIdIdx: index('snippet_user_id_idx').on(table.userId),
  userShortcutIdx: index('snippet_user_shortcut_idx').on(table.userId, table.shortcut),
}));

// Discharge summaries table
export const dischargeSummaries = pgTable('discharge_summaries', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  sections: jsonb('sections').notNull(),
  citations: jsonb('citations').notNull(),
  generatedAt: timestamp('generated_at', { mode: 'date' }).defaultNow().notNull(),
}, table => ({
  patientIdIdx: index('discharge_patient_id_idx').on(table.patientId),
}));

// Analytics events table
export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => userProfiles.id, { onDelete: 'set null' }),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  eventData: jsonb('event_data'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
}, table => ({
  userIdIdx: index('analytics_user_id_idx').on(table.userId),
  eventTypeIdx: index('analytics_event_type_idx').on(table.eventType),
  createdAtIdx: index('analytics_created_at_idx').on(table.createdAt),
}));

// Legacy counter table (keeping for compatibility)
export const counterSchema = pgTable('counter', {
  id: serial('id').primaryKey(),
  count: integer('count').default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
