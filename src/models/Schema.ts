import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
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

// Patients table - matches actual database structure
export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: text('user_id').notNull(), // Clerk user ID
  name: text('name').notNull(),
  age: integer('age').notNull(),
  sex: sexEnum('sex').notNull(),
  context: text('context'),
  discharge_text: text('discharge_text'),
  document_ids: jsonb('document_ids').notNull().default([]),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => ({
  userIdIdx: index('patient_user_id_idx').on(table.user_id),
}));

// Documents table
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id'), // Clerk user ID, nullable for community docs
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
  userId: text('user_id').notNull(), // Clerk user ID
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
  userId: text('user_id'), // Clerk user ID, nullable
  eventType: varchar('event_type', { length: 100 }).notNull(),
  eventData: jsonb('event_data'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
}, table => ({
  userIdIdx: index('analytics_user_id_idx').on(table.userId),
  eventTypeIdx: index('analytics_event_type_idx').on(table.eventType),
  createdAtIdx: index('analytics_created_at_idx').on(table.createdAt),
}));
