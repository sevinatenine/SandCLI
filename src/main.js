import { openMainWorldScreen, openSelectWorldScreen, startGui, stopGui } from "./gui.js";
import World from "./World.js";
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

async function main() {

    var world = null;

    var worldFile = args[0];

    if (options.new) {
        let [width, height] = SIZE_OPTIONS.normal;

        if (options.size) {
            const sizeArg = options.size.trim().toLowerCase();
            const preset = SIZE_OPTIONS[sizeArg];

            if (preset) {
                if (options.verbose) console.log(`Using size preset: ${options.size}.`);
                [width, height] = preset;
            } else {
                const split = sizeArg.split("x").map(n => parseInt(n, 10));

                if (split.length === 2 && split.every(n => Number.isInteger(n) && n > 0)) {
                    [width, height] = split;
                    if (options.verbose) console.log(`Using size ${width}x${height}.`);
                } else {
                    console.error(`Invalid size "${options.size}". Use a preset (${Object.keys(SIZE_OPTIONS).join(", ")}) or WIDTHxHEIGHT, like 100x40.`);
                    process.exit(1);
                }
            }
        } else {
            if (options.verbose) console.log(`Using default size: normal.`);
        }

        const { success, result } = createWorld(options.new, width, height);

        if (!success) {
            console.error("Failed to create world - ", result.message);
            process.exit(-1);

        } else {
            if (options.verbose) {
                console.log(`Created world ${options.new}.`);
            }
        }

    } else {
        if (worldFile) {
            var { success, result } = loadWorld(worldFile);

            if (success) {
                world = result;
                if (options.verbose) {
                    console.log("Loaded world")
                }
            } else {
                console.error("Failed to load world - ", result.message);
                process.exit(-1);
            }

            startGui();
            
            const gui = await openMainWorldScreen(world);
            initGame(gui, world);

        } else {

            if (options.verbose) {
                console.log("No world file provided - opening selection gui.")
            }

            startGui();
            const selectedWorld = (await openSelectWorldScreen()).text;

            var { success, result } = loadWorld(selectedWorld);

            if (success) {
                world = result;
                if (options.verbose) {
                    console.log("Loaded world");
                }
            } else {
                stopGui();
                console.error("Failed to load world - ", result.message);
                process.exit(-1);
            }

            const gui = await openMainWorldScreen(world);
            initGame(gui, world);
        }
    }
}

main();