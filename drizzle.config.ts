import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/schema.ts",
	out: "./drizzle",
	dbCredentials: {
		url: "./data",
	},
	breakpoints: true,
	verbose: true,
	strict: true,
	driver: "pglite",
});
