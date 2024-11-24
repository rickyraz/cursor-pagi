import { db } from "./db";
// import { createDB } from "./db";
import { books } from "./schema";

const seedBooks = async () => {
	try {
		// const db = await createDB();

		// Generate 50 sample books
		const sampleBooks = Array.from({ length: 50 }, (_, i) => ({
			title: `Book ${i + 1}`,
			author: `Author ${Math.floor(i / 5) + 1}`, // Each author has 5 books
		}));

		// Insert books one by one (PGlite limitation)
		for (const book of sampleBooks) {
			await db.insert(books).values(book);
		}

		console.log("Successfully seeded 50 books");
	} catch (error) {
		console.error("Error seeding database:", error);
	}
};

seedBooks();
