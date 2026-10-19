import { existsSync, cpSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

export function ensureUnblessedData() {
    try {
        const distDir = path.dirname(fileURLToPath(import.meta.resolve("@unblessed/core")));
        const dest = path.join(distDir, "data");
        const src = path.join(distDir, "..", "data");

        if (existsSync(dest) || !existsSync(src)) return;
        cpSync(src, dest, { recursive: true });
    } catch (e) {
        if (process.argv.includes("-v") || process.argv.includes("--verbose")) {
            console.error(`Could not patch @unblessed/core data folder: ${e.message}`);
        }
    }
}