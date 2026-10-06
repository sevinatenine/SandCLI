import { setRuntime, NodeRuntime, Screen, Box } from '@unblessed/node';
import { List } from '@unblessed/core';
import { readdirSync } from "fs";
import getConf from "./config.js";

setRuntime(new NodeRuntime());

var screen;

function startGui() {
    screen = new Screen({ smartCSR: true });
    screen.key(['escape', 'q'], () => process.exit(0));
}

function stopGui() {
    if (screen) {
        screen.destroy();
        screen = null;
    }
}

let worldBox = null;
let selectBox = null;

var selectedWorld = null;

async function openMainWorldScreen(world) {
    selectedWorld = world;

    worldBox = new Box({
        parent: screen,
        top: 'center',
        left: 'center',
        width: 120,
        height: 40,
        content: 'Hello World!',
        border: { type: 'line' },
        style: {
            fg: 'white',
            bg: 'blue',
            border: { fg: '#f0f0f0' }
        }
    });

    screen.render();
}

function openSelectWorldScreen() {
    return new Promise((resolve) => {
        selectBox = new List({
            parent: screen,
            top: 'center',
            left: 'center',
            width: '50%',
            height: '50%',
            label: ' Select a world file to open. ',
            border: { type: 'line' },
            keys: true,
            mouse: true,
            interactive: true,
            items: readdirSync(getConf()["worldsFolder"] || "./worlds").map(e => e.slice(0,-(getConf()["ext"] || ".sw").length)),
            style: {
                selected: { bg: 'blue', fg: 'white', bold: true },
                item: { fg: 'cyan' },
                border: { fg: 'white' }
            }
        });

        selectBox.focus();

        selectBox.on('select', (item, index) => {
            const selectedText = item.getText();

            selectBox.destroy();
            selectBox = null;
            screen.render();

            resolve({ text: selectedText, index });
        });

        screen.render();
    });
}

export { openMainWorldScreen, openSelectWorldScreen, startGui, stopGui };