CREATE TABLE IF NOT EXISTS "books" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"author" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
