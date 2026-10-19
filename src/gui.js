import { setRuntime, NodeRuntime, Screen, Box } from '@unblessed/node';
import { List } from '@unblessed/core';
import { readdirSync } from "fs";
import getConf from "./config.js";
import { ensureUnblessedData } from "./patch.js";

setRuntime(new NodeRuntime());

var screen;

function startGui() {
    ensureUnblessedData();
    // On Windows, TERM is usually unset, so unblessed falls back to the
    // "windows-ansi" terminfo, which only declares 8 colors. Every palette color
    // above 8 then gets squashed down (dark browns and grays become black).
    // Windows Terminal and modern conhost handle 256 colors fine, so ask for that.
    const terminal = process.platform === "win32" && !process.env.TERM ? "xterm-256color" : undefined;
    screen = new Screen({ smartCSR: false, terminal });

    screen.on('keypress', (ch, key) => {
        if (!confirmState) return;
        const name = key && key.name;
        if (ch === 'y' || ch === 'Y' || name === 'enter') resolveConfirm(true);
        else if (ch === 'n' || ch === 'N' || name === 'escape') resolveConfirm(false);
    });
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
var selectBox = null;

async function openMainWorldScreen(world) {
    selectedWorld = world;

    worldBox = new Box({
        parent: screen,
        top: 'center',
        left: 'center',
        tags: false,
        wrap: false,
        width: world.width+2,
        height: world.height+2,
        content: '',
        border: { type: 'line' },
        style: {
            fg: 'white',
            bg: 'black',
            border: { fg: '#f0f0f0' }
        }
    });

    infoBox = new Box({
        parent: screen,
        bottom: 0,
        left: 0,
        width: '100%',
        height: 7,
        tags: true,
        content: `Particles: ${world.particleCount} | ${world.paused ? "Paused" : "Running"}`,
        border: { type: 'line' },
        style: {
            fg: 'white',
            border: { fg: '#f0f0f0' }
        },
        mouse: true,
        clickable: true,
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

        selectBox.key(['q', 'escape'], () => {
            selectBox.destroy();
            selectBox = null;
            stopGui();
            process.exit(0);
        });

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
}

function updateBoxContents(text) {
    if (!worldBox) return;
    worldBox.setContent(text);
}

function render() {
    if (screen) screen.render();
}

let confirmState = null;

let confirmBox = null;

function askConfirm(message, onYes) {
    confirmState = { message, onYes };

    confirmBox = new Box({
        parent: screen,
        top: 'center',
        left: 'center',
        width: Math.max(message.length + 6, 24),
        height: 5,
        tags: false,
        align: 'center',
        content: `\n${message}`,
        border: { type: 'line' },
        style: { fg: 'white', bg: 'black', border: { fg: 'red' } }
    });

    screen.render();
}

function isConfirming() { return confirmState !== null; }
function confirmMessage() { return confirmState ? confirmState.message : null; }

function resolveConfirm(yes) {
    const c = confirmState;
    confirmState = null;

    if (confirmBox) {
        confirmBox.destroy();
        confirmBox = null;
    }
    screen.render();

    if (yes) c.onYes();
}

function onInfoClick(fn) {
    infoBox.on('click', (data) => {
        const x = data.x - infoBox.aleft - infoBox.ileft;
        const y = data.y - infoBox.atop - infoBox.itop;
        fn(x, y);
    });
}

function onWorldClick(fn) {
    worldBox.on('click', (data) => {
        const x = data.x - worldBox.aleft - worldBox.ileft;
        const y = data.y - worldBox.atop - worldBox.itop;
        fn(x, y);
    });
}

function registerKeyListener(keys, fn) {
    screen.key(keys, (...args) => { if (!confirmState) fn(...args); });
}
export { openMainWorldScreen, openSelectWorldScreen, startGui, stopGui, updateInfo, updateBoxContents, render, registerKeyListener, askConfirm, isConfirming, confirmMessage, resolveConfirm, onInfoClick, onWorldClick };