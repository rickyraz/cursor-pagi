import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { PGlite } from "@electric-sql/pglite";
import type { drizzle } from "drizzle-orm/pglite";

type DrizzleClient = ReturnType<typeof drizzle>;

export async function up(db: DrizzleClient) {
	// 1. Buat tabel temporary dengan struktur yang sama tapi ID sebagai text
	await db.execute(sql`
        CREATE TABLE books_new (
          id TEXT PRIMARY KEY DEFAULT nanoid(),
          title VARCHAR(255) NOT NULL,
          author VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

	// 2. Salin data dari tabel lama ke tabel baru, konversi ID ke text
	await db.execute(sql`
        INSERT INTO books_new (id, title, author, created_at)
        SELECT id::text, title, author, created_at
        FROM books
      `);

	// 3. Drop tabel lama
	await db.execute(sql`DROP TABLE books`);

	// 4. Rename tabel baru ke nama asli
	await db.execute(sql`ALTER TABLE books_new RENAME TO books`);
}

export async function down(db: DrizzleClient) {
	// Rollback logic jika diperlukan
	await db.execute(sql`
    CREATE TABLE books_old (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

	await db.execute(sql`
    INSERT INTO books_old (id, title, author, created_at)
    SELECT id::integer, title, author, created_at
    FROM books
    WHERE id ~ E'^\\d+$'
  `);

	await db.execute(sql`DROP TABLE books`);
	await db.execute(sql`ALTER TABLE books_old RENAME TO books`);
}
