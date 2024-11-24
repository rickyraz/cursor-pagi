import * as fs from "node:fs";
import * as path from "node:path";
import { books } from "../src/schema";
import { db } from "../src/db";
// import { createDB } from "../src/db";

async function backupData() {
	const backupDir = path.join(process.cwd(), "backup");
	if (!fs.existsSync(backupDir)) {
		fs.mkdirSync(backupDir, { recursive: true });
	}

	// const db = await createDB();

	try {
		const allBooks = await db.select().from(books);

		// Simpan ke file JSON
		fs.writeFileSync(
			"./backup/books_backup.json",
			JSON.stringify(allBooks, null, 2),
		);

		console.log("Backup completed successfully");
	} catch (error) {
		console.error("Error during backup:", error);
		process.exit(1);
	}

	process.exit(0);
}

backupData();
