#!/usr/bin/env node

import { openMainWorldScreen, openSelectWorldScreen, startGui, stopGui } from "./gui.js";
import { createWorld, loadWorld } from "./worlds.js";
import { options, args } from "./args.js";
import { initGame } from "./game.js";

const SIZE_OPTIONS = {
    tiny:   [40, 12],
    small:  [60, 20],
    normal: [78, 22],
    large:  [120, 35],
    giant:  [200, 55],
};

function parseSize() {
    if (!options.size) return SIZE_OPTIONS.normal;

    const sizeArg = options.size.trim().toLowerCase();
    if (SIZE_OPTIONS[sizeArg]) return SIZE_OPTIONS[sizeArg];

    const split = sizeArg.split("x").map(n => parseInt(n, 10));
    if (split.length === 2 && split.every(n => Number.isInteger(n) && n > 0)) {
        return split;
    }

    console.error(`Invalid size "${options.size}". Use a preset (${Object.keys(SIZE_OPTIONS).join(", ")}) or WIDTHxHEIGHT, like 100x40.`);
    process.exit(1);
}

async function main() {
    const [width, height] = parseSize();
    const name = options.new || args[0];
    let world = null;

    if (options.new) {
        const res = createWorld(name, width, height);
        if (!res.success) {
            console.error("Failed to create world - ", res.result.message);
            process.exit(1);
        }
        world = res.result;
        if (options.verbose) console.log(`Created world ${name} (${width}x${height}).`);
        process.exit();
    } else if (name) {
        const res = loadWorld(name, width, height);
        if (!res.success) {
            console.error("Failed to load world - ", res.result.message);
            process.exit(1);
        }
        world = res.result;
        if (options.verbose) console.log(res.created ? `Created new world ${name}.` : "Loaded world.");
    }

    startGui();

    if (!world) {
        if (options.verbose) console.log("No world file provided - opening selection gui.");

        const selected = (await openSelectWorldScreen())?.text;
        if (!selected) {
            stopGui();
            return;
        }

        const res = loadWorld(selected);
        if (!res.success) {
            stopGui();
            console.error("Failed to load world - ", res.result.message);
            process.exit(1);
        }
        world = res.result;
    }

    const gui = await openMainWorldScreen(world);
    initGame(gui, world);
}

main();