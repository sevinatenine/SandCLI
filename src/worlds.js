import World from "./World.js";
import getConf from "./config.js";
import path from "path";
import os from "os";
import { readFileSync, writeFileSync, mkdirSync } from "fs";

const conf = getConf();
const ext = conf["ext"] || ".sw";
const worldsPath = path.resolve(
    conf["worldsFolder"] || path.join(os.homedir(), ".sandcli", "worlds")
);

function worldFilePath(name) {
    return path.join(worldsPath, `${path.basename(name)}${ext}`);
}

function loadWorld(name) {
    try {
        const raw = readFileSync(worldFilePath(name), "utf8");
        const world = World.fromObject(JSON.parse(raw));
        return { success: true, result: world };
    } catch (e) {
        return { success: false, result: e };
    }
}

function saveWorld(name, world) {
    try {
        mkdirSync(worldsPath, { recursive: true });
        writeFileSync(worldFilePath(name), JSON.stringify(world.toObject()));
        return { success: true, result: world };
    } catch (e) {
        return { success: false, result: e };
    }
}

function createWorld(name, width, height) {
    const world = new World(name, width, height);
    return saveWorld(name, world);
}

export { loadWorld, createWorld, saveWorld };