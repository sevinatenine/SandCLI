import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import os from 'os';
import { options, args } from "./args.js";

const config = {
    worldsFolder: path.join(os.homedir(), '.sandcli', 'worlds')
};

if (!existsSync(config.worldsFolder)) {
  mkdirSync(config.worldsFolder, { recursive: true });
}

// try {
//     const configFile = readFileSync(path.join(import.meta.dirname, "../config.json"), "utf-8");
//     config = JSON.parse(configFile);

//     if (options.verbose) {
//         console.log(`Loaded a config file with ${Object.keys(config).length} items.`);
//     }
// } catch (e) {
//     if (options.verbose) {
//         console.log(`Failed to load config file: ${e}.`);
//     }
// }

export default function getConf() {
    return config || null;
}