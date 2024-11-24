import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import logixlysia from "logixlysia";
import {
	fetchBooks,
	fetchBook,
	createBook,
	updateBook,
	deleteBook,
} from "./book";
import { initDB } from "./db";

const app = new Elysia()
	.use(swagger())
	.use(
		logixlysia({
			config: {
				showStartupMessage: true,
				startupMessageFormat: "simple",
				timestamp: {
					translateTime: "yyyy-mm-dd HH:MM:ss",
				},
				ip: true,
				logFilePath: "./logs/example.log",
				customLogFormat:
					"🦊 {now} {level} {duration} {method} {pathname} {status} {message} {ip} {epoch}",
				// logFilter: {
				// 	level: ["ERROR", "WARNING"],
				// 	status: [500, 404],
				// 	method: "GET",
				// },
			},
		}),
	)
	.onStart(async () => {
		try {
			console.log("Ensuring database connection...");
			await initDB();
			console.log("Database connection confirmed!");
		} catch (error) {
			console.error("Failed to initialize database:", error);
			process.exit(1);
		}
	});

/**
 * Get all books
 */
app.get("/books", async ({ query }) => {
	// Destructure query parameters dengan default values
	const { limit = "30", cursor, direction = "desc", search } = query || {};

	// Validasi direction dengan type guard
	const isValidDirection = (dir: string): dir is "asc" | "desc" => {
		return dir === "asc" || dir === "desc";
	};

	// Konversi dan validasi parameters
	const validatedParams = {
		limit: Math.max(1, Math.min(100, Number.parseInt(limit.toString()) || 30)), // Min 1, Max 100
		// cursor: cursor?.toString(),
		// Konversi cursor string ke number jika ada
		cursor: cursor ? cursor.toString() : undefined,
		direction: isValidDirection(direction) ? direction : "desc", // Memastikan tipe adalah "asc" | "desc"
		search: search?.toString()?.trim(),
	};

	// Log untuk debugging
	// console.log("Fetching books with params:", validatedParams);
	const result = await fetchBooks(validatedParams);

	return {
		success: true,
		...result,
	};
	// return fetchBooks();
});

/**
 * Get book by id
 */
app.get("books/:id", ({ params: { id } }) => fetchBook(id), {
	params: t.Object({
		id: t.String(),
	}),
});

/**
 * Create book
 */
app.post("/books", ({ body }) => createBook(body), {
	body: t.Object({
		title: t.String({
			minLength: 1,
			maxLength: 255,
			error: "Title is required and must be between 1 and 255 characters",
		}),
		author: t.String({
			minLength: 1,
			maxLength: 255,
			error: "Author is required and must be between 1 and 255 characters",
		}),
	}),
});

/**
 * Update book
 */
app.put("/books/:id", ({ params: { id }, body }) => updateBook(id, body), {
	params: t.Object({
		id: t.String(),
	}),
	body: t.Object({
		title: t.String(),
		author: t.String(),
	}),
});

/**
 * Delete book
 */
app.delete("/books/:id", ({ params: { id } }) => deleteBook(id), {
	params: t.Object({
		id: t.String(),
	}),
});

app.listen(3000);
