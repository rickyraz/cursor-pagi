import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

type DrizzleInstance = ReturnType<typeof drizzle>;

// Inisialisasi dengan null
let dbInstance: DrizzleInstance | null = null;
let dbPromise: Promise<DrizzleInstance> | null = null;

export const initDB = async (): Promise<DrizzleInstance> => {
	if (!dbPromise) {
		dbPromise = (async () => {
			if (!dbInstance) {
				const client = await PGlite.create({
					dataDir: "data",
					maxConnections: 10,
					connectionTimeoutMillis: 0,
					idleTimeoutMillis: 0,
				});
				dbInstance = drizzle({ client });
			}
			return dbInstance;
		})();
	}
	return dbPromise;
};

export const getDB = (): DrizzleInstance => {
	if (!dbInstance) {
		throw new Error(
			"Database not initialized. Call initDB() before using the database.",
		);
	}
	return dbInstance;
};

// Initialize DB dan export instance
const initializeDB = async () => {
	const instance = await initDB();
	return instance;
};

export const db = await initializeDB();

// Export type untuk TypeScript support
export type DB = DrizzleInstance;
