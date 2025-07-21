import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		clearMocks: true,
		coverage: {
			all: true,
			include: ["src/**/*.ts"], // Ensure this points to your source files
			exclude: ["lib", "node_modules", "**/*.test.ts"], // Exclude test files from coverage
			reporter: ["html", "lcov", "text"], // Add 'text' for console output
			provider: "v8", // Explicitly set the coverage provider
		},
		exclude: ["lib", "node_modules"],
		setupFiles: ["console-fail-test/setup"],
	},
});
