import { defineConfig } from "tsdown";

export default defineConfig({
	dts: true,
	entry: "./src/index.ts",
	outDir: "lib",
	name: "permit-core",
});
