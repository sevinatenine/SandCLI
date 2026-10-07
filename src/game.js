import { saveWorld } from "./worlds.js";
import { updateInfo, updateBoxContents, render, registerKeyListener } from "./gui.js";
import chalk from 'chalk';

const FPS = 20;

var mainScreen = null;
var world = null;

const SOLID = 0;
const LIQUID = 1;
const GAS = 2;

const PARTICLES = {
    dirt: [1, SOLID, '+'],
    gravel: [2, SOLID, '-']
};

const CHARS = [' '];
const KINDS = [null];

for (const [id, kind, char] of Object.values(PARTICLES)) {
    CHARS[id] = char;
    KINDS[id] = kind;
}

function idx(x, y) { return y * world.width + x; }
function xyid(i) { return [i % world.width, Math.floor(i / world.width)]; }

function normalizeGrid(world) {
    const size = world.width * world.height;
    const old = Array.isArray(world.grid) || world.grid instanceof Uint8Array ? world.grid : [];
    const grid = new Uint8Array(size);
    if (old.length === size) grid.set(old);
    world.grid = grid;

    let count = 0;
    for (let i = 0; i < grid.length; i++) if (grid[i] !== 0) count++;
    world.particleCount = count;
}

function createParticleRaw(x, y, type) {
    if (x < 0 || y < 0 || x >= world.width || y >= world.height) return;
    const i = idx(x, y);
    if (world.grid[i] === 0) world.particleCount++;
    world.grid[i] = type;
}

function createParticle(x, y, type) {
    setCell(x, y, PARTICLES[type][0]);
}

function setCell(x, y, type) {
    if (x < 0 || y < 0 || x >= world.width || y >= world.height) return;
    const i = idx(x, y);
    const prev = world.grid[i];
    if (prev === type) return;
    if (prev === 0) world.particleCount++;
    else if (type === 0) world.particleCount--;
    world.grid[i] = type;
}

var cursorX = 0;
var cursorY = 0;

function updateDisplay() {
    const { width, height, grid } = world;
    const lines = [];
    for (let y = 0; y < height; y++) {
        let line = "";
        for (let x = 0; x < width; x++) {
            if (x == cursorX && y == cursorY) {
                line += chalk.underline(CHARS[grid[y * width + x]]);
            } else {
                line += CHARS[grid[y * width + x]];
            }
        }
        lines.push(line);
    }
    updateBoxContents(lines.join("\n"));
    render();
}

function initGame(gui, w) {
    mainScreen = gui;
    world = w;

    cursorX = Math.floor(world.width/2);
    cursorY = Math.floor(world.height/2);

    if (!world.grid) {
        world.grid = [];
    }

    normalizeGrid(world);

    saveGame();

    registerKeyListener(['escape', 'q'], () => {
        saveGame();
        process.exit(0);
    });

    registerKeyListener(['p', 'P'], () => {
        world.paused = !world.paused;
        updateDisplay();
    });

    registerKeyListener(['w'], () => {
        cursorY--;
    });

    registerKeyListener(['s'], () => {
        cursorY++;
    });

    registerKeyListener(['a'], () => {
        cursorX--;
    });

    registerKeyListener(['d'], () => {
        cursorX++;
    });

    registerKeyListener(['space'], () => {
        createParticle(cursorX,cursorY,"dirt");
        updateDisplay();
    });

    setInterval(saveGame, 5 * 1000);
    setInterval(gameLoop, 1000/FPS);
}

function saveGame() {
    saveWorld(world.name, world);
}

function step() {
    const { width, height, grid } = world;

    for (let y = height - 2; y >= 0; y--) {
        for (let x = 0; x < width; x++) {
            const i = idx(x, y);
            const type = grid[i];
            if (type === 0) continue;

            const below = idx(x, y + 1);
            if (grid[below] === 0) {
                grid[below] = type;
                grid[i] = 0;
                continue;
            }

            const leftValid = x > 0 && grid[idx(x - 1, y + 1)] === 0;
            const rightValid = x < width - 1 && grid[idx(x + 1, y + 1)] === 0;

            let target = -1;
            if (leftValid && rightValid) {
                target = Math.random() < 0.5 ? idx(x - 1, y + 1) : idx(x + 1, y + 1);
            } else if (leftValid) {
                target = idx(x - 1, y + 1);
            } else if (rightValid) {
                target = idx(x + 1, y + 1);
            }

            if (target !== -1) {
                grid[target] = type;
                grid[i] = 0;
            }
        }
    }

    let lowest = -1;
    for (let i = 0; i < grid.length; i++) {
        if (grid[i] !== 0) lowest = Math.max(lowest, Math.floor(i / width));
    }
}

function gameLoop() {
    if (!world.paused) step();
    updateDisplay();
    updateInfo(`Particles: ${world.particleCount} | ${world.paused ? "Paused" : "Running"}\n\n\n${chalk.underline("Q")}uit ${chalk.underline("P")}ause/play`);
    render();
}

export { initGame };