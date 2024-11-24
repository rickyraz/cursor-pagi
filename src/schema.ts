import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-typebox";
import { nanoid } from "nanoid";

export const books = pgTable("books", {
	// id: serial("id")
	// 	.primaryKey()
	id: text("id")
		.primaryKey()
		.$defaultFn(() => nanoid()),
	title: varchar("title", { length: 255 }).notNull(),
	author: varchar("author", { length: 255 }).notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

// Tipe untuk select dan insert
export type BookSelect = typeof books.$inferSelect;
export type BookInsert = typeof books.$inferInsert;
