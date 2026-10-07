import { setRuntime, NodeRuntime, Screen, Box } from '@unblessed/node';
import { List } from '@unblessed/core';
import { readdirSync } from "fs";
import getConf from "./config.js";

setRuntime(new NodeRuntime());

var screen;

function startGui() {
    screen = new Screen({ smartCSR: true });
}

function stopGui() {
    if (screen) {
        screen.destroy();
        screen = null;
    }
}

var selectedWorld = null;
let worldBox = null;
let infoBox = null;

async function openMainWorldScreen(world) {
    selectedWorld = world;

    worldBox = new Box({
        parent: screen,
        top: 'center',
        left: 'center',
        width: world.width+2,
        height: world.height+2,
        content: '',
        border: { type: 'line' },
        style: {
            fg: 'white',
            bg: 'blue',
            border: { fg: '#f0f0f0' }
        }
    });

    infoBox = new Box({
        parent: screen,
        bottom: 0,
        left: 0,
        width: '100%',
        height: 6,
        content: `Particles: ${world.particleCount} | ${world.paused ? "Paused" : "Running"}`,
        border: { type: 'line' },
        style: {
            fg: 'white',
            border: { fg: '#f0f0f0' }
        }
    });

    screen.render();

    return { worldBox, infoBox };
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

function updateInfo(text) {
    if (!infoBox) return;
    infoBox.setContent(text);
    screen.render();
}

function updateBoxContents(text) {
    if (!worldBox) return;
    worldBox.setContent(text);
    screen.render();
}

function render() {
    if (screen) screen.render();
}

function registerKeyListener(...args) {
    screen.key(...args);
}

export { openMainWorldScreen, openSelectWorldScreen, startGui, stopGui, updateInfo, updateBoxContents, render, registerKeyListener };