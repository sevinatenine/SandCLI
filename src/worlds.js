import World from "./World.js"
import getConf from "./config.js";
import path from "path";
import { readFileSync, writeFileSync } from "fs";

const worldsPath = path.join(import.meta.dirname, '..', getConf()["worldsFolder"] || "./worlds");

function loadWorld(name) {
    const worldFile = path.join(worldsPath, `${name}${(getConf()["ext"] || ".sw")}`);
    try {
        var worldRaw = readFileSync(worldFile);
        var worldJSON = JSON.parse(worldRaw);
        var world = World.fromObject(worldJSON);
    } catch (e) {
        return { success: false, result: e };
    }

    return { success: true, result: world };
}

function saveWorld(name, world) {
    const worldFile = path.join(worldsPath, `${name}${(getConf()["ext"] || ".sw")}`);
    try {
        writeFileSync(worldFile, JSON.stringify(world.toObject()));
    } catch (e) {
        return { success: false, result: e };
    }

    return { success: true, result: world };
}

function createWorld(name, width, height) {
    var world = new World(name, width, height);
    return saveWorld(name, world);
}

export {
    loadWorld,
    createWorld,
    saveWorld
}