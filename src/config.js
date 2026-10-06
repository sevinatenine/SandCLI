import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { options, args } from "./args.js";

var config;

try {
    const configFile = readFileSync(path.join(import.meta.dirname, "../config.json"), "utf-8");
    config = JSON.parse(configFile);

    if (options.verbose) {
        console.log(`Loaded a config file with ${Object.keys(config).length} items.`);
    }
} catch (e) {
    if (options.verbose) {
        console.log(`Failed to load config file: ${e}.`);
    }
}

export default function getConf() {
    return config || null;
}