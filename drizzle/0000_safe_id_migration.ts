import { sql } from "drizzle-orm";
import type { drizzle } from "drizzle-orm/pglite";

type DrizzleClient = ReturnType<typeof drizzle>;

export async function up(db: DrizzleClient) {
	await db.execute(sql`
    -- Create new table with desired structure
    CREATE TABLE books_new (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Copy data with ID conversion
    INSERT INTO books_new (id, title, author, created_at)
    SELECT 
      CAST(id AS TEXT), -- Convert existing numeric IDs to text
      title,
      author,
      created_at
    FROM books;

    -- Rename tables
    ALTER TABLE books RENAME TO books_old;
    ALTER TABLE books_new RENAME TO books;

    -- Create indexes
    CREATE INDEX books_title_author_idx ON books (title, author);

    -- Optionally keep the old table as backup
    -- DROP TABLE books_old;
  `);
}

export async function down(db: DrizzleClient) {
	await db.execute(sql`
    -- Restore from old table if it exists
    ALTER TABLE books RENAME TO books_temp;
    ALTER TABLE books_old RENAME TO books;
    DROP TABLE books_temp;
    DROP INDEX IF EXISTS books_title_author_idx;
  `);
}
