import { eq, lt, gt, desc, asc, and, ilike, or, count } from "drizzle-orm";
import { type BookInsert, books, type BookSelect } from "./schema";
// import { createDB } from "./db";
import { db } from "./db";

// Types
interface PaginationParams {
	limit?: number;
	// cursor?: number;
	cursor?: string; // Ubah ke string
	direction?: "asc" | "desc";
	search?: string;
}

interface PaginatedResponse<T> {
	data: T[];
	// nextCursor?: number;
	nextCursor?: string;
	hasMore: boolean;
	total: number;
}
export const fetchBooks = async ({
	limit = 30,
	cursor,
	direction = "desc",
	search,
}: PaginationParams = {}): Promise<PaginatedResponse<BookSelect>> => {
	try {
		// const db = await createDB();

		// Build base query
		const baseWhere = [];
		console.log("Applying search for:", search); // Debug log
		// Add search conditions if provided
		if (search) {
			baseWhere.push(
				or(
					ilike(books.title, `%${search}%`),
					ilike(books.author, `%${search}%`),
				),
			);
		}

		// Add cursor condition if provided
		if (cursor) {
			baseWhere.push(
				direction === "desc" ? lt(books.id, cursor) : gt(books.id, cursor),
			);
		}

		// Build and execute main query
		const mainQuery = db
			.select({
				id: books.id,
				title: books.title,
				author: books.author,
				createdAt: books.createdAt,
			})
			.from(books)
			.where(and(...baseWhere))
			.orderBy(direction === "desc" ? desc(books.id) : asc(books.id))
			.limit(limit + 1);

		const results = await mainQuery;

		// Process pagination results
		const hasMore = results.length > limit;
		const data = hasMore ? results.slice(0, limit) : results;
		const nextCursor =
			hasMore && data.length > 0 ? data[data.length - 1].id : undefined;

		// Count query using Drizzle count function
		// const countQuery = db
		// 	.select({
		// 		total: sql<number>`count(*)::integer`,
		// 	})
		// 	.from(books);

		const countQuery = db
			.select({
				total: count(),
			})
			.from(books);

		// Add search condition to count query if provided
		if (search) {
			countQuery.where(
				or(
					ilike(books.title, `%${search}%`),
					ilike(books.author, `%${search}%`),
				),
			);
		}

		const [{ total }] = await countQuery;

		return {
			data,
			nextCursor,
			hasMore,
			total: Number(total),
		};
	} catch (error) {
		console.error("Error fetching books:", error);
		throw error;
	}
};

export const fetchBook = async (id: string) => {
	return db.select().from(books).where(eq(books.id, id));
};

export const createBook = async (bookData: BookInsert) => {
	const [result] = await db.insert(books).values(bookData).returning();
	return result;
};

export const updateBook = async (id: string, bookData: Partial<BookInsert>) => {
	return db.update(books).set(bookData).where(eq(books.id, id)).returning();
};

export const deleteBook = async (id: string) => {
	return db.delete(books).where(eq(books.id, id)).returning();
};

// SAMPAH

// export const fetchBooks = async ({
// 	limit = 10,
// 	cursor,
// 	direction = "desc",
// 	search,
// }: PaginationParams = {}): Promise<PaginatedResponse<BookSelect>> => {
// 	// Build WHERE conditions
// 	const whereConditions: SQL[] = [];
// 	if (search) {
// 		const searchPattern = `%${search}%`;
// 		whereConditions.push(
// 			sql`(${books.title} ILIKE ${searchPattern} OR ${books.author} ILIKE ${searchPattern})`,
// 		);
// 	}
// 	if (cursor) {
// 		whereConditions.push(
// 			direction === "desc"
// 				? sql`${books.id} < ${cursor}`
// 				: sql`${books.id} > ${cursor}`,
// 		);
// 	}
// 	const whereSql = whereConditions.length
// 		? sql`WHERE ${sql.join(whereConditions, sql` AND `)}`
// 		: sql``;

// 	// Build complete query
// 	const rawQuery = sql`
//         SELECT
//         id,
//         title,
//         author,
//         created_at as "createdAt"
//         FROM ${books}
//         ${whereSql}
//         ORDER BY id ${direction === "desc" ? sql`DESC` : sql`ASC`}
//         LIMIT ${limit + 1}
//     `;

// 	// Execute query with type assertion
// 	const results = (await db.execute(rawQuery)) as unknown as BookResult[];

// 	// Process results
// 	const hasMore = results.length > limit;
// 	const data = hasMore ? results.slice(0, limit) : results;
// 	const nextCursor =
// 		hasMore && data.length > 0 ? data[data.length - 1].id : undefined;

// 	// Count total - Fixed version
// 	const countResult = (await db.execute(sql`
//         SELECT COUNT(*)::integer as total
//         FROM ${books}
//         ${whereSql}
//     `)) as unknown as [{ total: number }];

// 	const total = countResult[0]?.total ?? 0;

// 	return {
// 		data,
// 		nextCursor,
// 		hasMore,
// 		total,
// 	};
// };
