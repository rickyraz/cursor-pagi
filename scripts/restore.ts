import * as fs from "node:fs";
import * as path from "node:path";
// import { createDB } from "../src/db";
import { books } from "../src/schema";
// import { createDB } from "../src/db";
import { db } from "../src/db";

async function restoreData() {
	const backupPath = path.join(process.cwd(), "backup", "books_backup.json");

	// Cek apakah file backup ada
	if (!fs.existsSync(backupPath)) {
		console.error("Backup file not found:", backupPath);
		process.exit(1);
	}

	// const db = await createDB();

	try {
		console.log("Reading backup file...");
		const backupData = JSON.parse(fs.readFileSync(backupPath, "utf-8"));

		console.log(`Found ${backupData.length} books to restore`);

		// Restore data
		let restored = 0;
		for (const book of backupData) {
			await db.insert(books).values({
				id: String(book.id), // Convert to string
				title: book.title,
				author: book.author,
				createdAt: new Date(book.createdAt),
			});
			restored++;
			if (restored % 100 === 0) {
				console.log(`Restored ${restored} books...`);
			}
		}

		console.log(`Restore completed successfully. Restored ${restored} books.`);
	} catch (error) {
		console.error("Error during restore:", error);
		process.exit(1);
	}

	process.exit(0);
}

restoreData().catch((err) => {
	console.error("Unhandled error:", err);
	process.exit(1);
});
