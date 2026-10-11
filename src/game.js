import { saveWorld } from "./worlds.js";
import { updateInfo, updateBoxContents, render, registerKeyListener, askConfirm, isConfirming, confirmMessage, onInfoClick, onWorldClick } from "./gui.js";
import chalk from 'chalk';
chalk.level = 2;

const FPS = 20;

var mainScreen = null;
var world = null;

const SOLID = 0;
const LIQUID = 1;
const GAS = 2;
const STATIC = 3;

const PARTICLES = {
    seed:      { id: 30,  kind: SOLID,  char: chalk.greenBright('`'),        name: chalk.greenBright('Seed'),      density: 1, flam: 0.08, burnOutChance: 0.05 },
    dirt:      { id: 1,  kind: SOLID,  char: chalk.hex("#764109")('*'),               name: chalk.hex("#764109")('Dirt'),      density: 3 },
    gravel:    { id: 2,  kind: SOLID,  char: chalk.gray('$'),               name: chalk.gray('Gravel'),    density: 4 },
    sand:      { id: 4,  kind: SOLID,  char: chalk.yellow(':'),             name: chalk.yellow('Sand'),    density: 3.5 },
    coal:      { id: 5,  kind: SOLID,  char: chalk.hex('#6b6b6b')('o'),   name: chalk.hex('#6b6b6b')('Coal'), density: 2.5, flam: 0.03, burnOutChance: 0.002 },
    ash:       { id: 6,  kind: SOLID,  char: chalk.hex('#9f9f9f')(','),              name: chalk.hex('#9f9f9f')('Ash'),      density: 1 },
    petal:     { id: 35,  kind: SOLID,  char: chalk.hex('#c320c9')('*'),              name: chalk.hex('#c320c9')('Petal'),      density: 1 },
    snow:      { id: 7,  kind: SOLID,  char: chalk.whiteBright('.'),        name: chalk.whiteBright('Snow'), density: 1.5, melt: 'water' },
    gunpowder: { id: 8,  kind: SOLID,  char: chalk.dim('%'),                name: chalk.dim('Gunpowder'),  density: 3.2, boom: 2 },

    water:     { id: 3,  kind: LIQUID, char: chalk.cyan('w'),               name: chalk.cyan('Water'),     density: 2,   disp: 40 },
    oil:       { id: 9,  kind: LIQUID, char: chalk.hex('#a0522d')('~'),   name: chalk.hex('#a0522d')('Oil'), density: 1, disp: 25, speed: 0.8, flam: 0.4, burnOutChance: 0.001 },
    lava:      { id: 10, kind: LIQUID, char: chalk.hex('#ff6a00')('@'),   name: chalk.hex('#ff6a00')('Lava'), density: 5, disp: 6, speed: 0.25 },
    acid:      { id: 11, kind: LIQUID, char: chalk.greenBright('a'),        name: chalk.greenBright('Acid'), density: 2.2, disp: 30 },

    steam:     { id: 12, kind: GAS,    char: chalk.whiteBright('"'),        name: chalk.whiteBright('Steam'), density: -1 },
    smoke:     { id: 13, kind: GAS,    char: chalk.gray(';'),               name: chalk.gray('Smoke'),     density: -2 },
    fumes:     { id: 26, kind: GAS,    char: chalk.greenBright('&'),        name: chalk.greenBright('Fumes'), density: -1.7 },
    methane:   { id: 14, kind: GAS,    char: chalk.green('g'),              name: chalk.green('Methane'),  density: -1.5, flam: 0.6, burnOutChance: 0.5 },

    stone:     { id: 15, kind: STATIC, char: chalk.gray('#'),               name: chalk.gray('Stone'),     density: 9 },
    wall:      { id: 16, kind: STATIC, char: chalk.whiteBright('█'),        name: chalk.whiteBright('Wall'), density: 9, hard: true },
    conveyerL: { id: 32, kind: STATIC, char: chalk.gray('<'),        name: chalk.gray('Conveyer <'), density: 9, hard: true, direction: [-1, 0] },
    conveyerR: { id: 33, kind: STATIC, char: chalk.gray('>'),        name: chalk.gray('Conveyer >'), density: 9, hard: true, direction: [1, 0] },
    obsidian:  { id: 29, kind: STATIC, char: chalk.hex("#33008a")('#'),   name: chalk.hex("#33008a")('Obsidian'), density: 9, hard: true },
    wood:      { id: 17, kind: STATIC, char: chalk.hex('#8b5a2b')('H'),   name: chalk.hex('#8b5a2b')('Wood'), density: 9, flam: 0.05, burnOutChance: 0.01 },
    glass:     { id: 18, kind: STATIC, char: chalk.cyanBright('+'),         name: chalk.cyanBright('Glass'), density: 9, hard: true },
    ice:       { id: 19, kind: STATIC, char: chalk.blueBright('='),         name: chalk.blueBright('Ice'), density: 9, melt: 'water' },
    plant:     { id: 20, kind: STATIC, char: chalk.green('Y'),              name: chalk.green('Plant'),    density: 9, flam: 0.08, burnOutChance: 0.04 },
    napalm:    { id: 31,  kind: STATIC,  char: chalk.hex('#b3b0b0')('#'),   name: chalk.hex('#b3b0b0')('Napalm'), flam: 0.15, burnOutChance: 0.0008 },
    burner:    { id: 34,  kind: STATIC,  char: chalk.red('?'), name: chalk.red('Burner'), hard: true },
    freezer: { id: 36, kind: STATIC, char: chalk.blueBright('&'), name: chalk.blueBright('Freezer'), density: 9, hard: true },

    fire:      { id: 21, kind: STATIC, char: chalk.redBright('^'),          name: chalk.redBright('Fire'), density: 9, hard: true, burnOutChance: 0.08 },
    tnt:       { id: 22, kind: STATIC, char: chalk.redBright('T'),          name: chalk.redBright('TNT'),  density: 9, boom: 6 },

    faucet:    { id: 23, kind: STATIC, char: chalk.cyanBright('F'),         name: chalk.cyanBright('Faucet'), density: 9, hard: true, emit: 'water', rate: 0.5 },
    lavavent:  { id: 24, kind: STATIC, char: chalk.hex('#ff6a00')('V'),   name: chalk.hex('#ff6a00')('Lava vent'), density: 9, hard: true, emit: 'lava', rate: 0.15 },
    void:      { id: 25, kind: STATIC, char: chalk.magenta('O'),            name: chalk.magenta('Void'),   density: 9, hard: true, drain: true, rate: 0.52 },
    sink:      { id: 27, kind: STATIC, char: chalk.yellow(','),             name: chalk.yellow('Sink'),   density: 9, hard: true, drain: true, rate: 0.7, drainType: ((e) => e.id === ID.water) },
    fluiddrain: { id: 28, kind: STATIC, char: chalk.hex('#c55600')('#'),  name: chalk.hex('#c55600')('Fluid Drain'),   density: 9, hard: true, drain: true, rate: 0.52, drainType: ((e) => e.kind === LIQUID) },
};

const SECTIONS = {
    ground: { name: "Ground", items: ["dirt", "gravel", "sand", "coal", "ash", "snow", "seed"] },
    fluids: { name: "Fluids", items: ["water", "oil", "lava", "acid"] },
    gases:  { name: "Gases",  items: ["steam", "smoke", "fumes", "methane"] },
    solids: { name: "Solids", items: ["stone", "wall", "wood", "glass", "ice", "plant", "obsidian"] },
    energy: { name: "Energy", items: ["fire", "gunpowder", "tnt", "napalm"] },
    machines: {name: "Machines", items: ["conveyerL", "conveyerR", "burner", "freezer", "faucet", "lavavent", "sink", "fluiddrain"]},
    tools:  { name: "Tools",  items: ["void", "eraser"] },
};

const ID = { eraser: 0 };
const P = [null];
const CHARS = [' '];
const KINDS = [null];
const NAMES = [chalk.dim('Eraser')];
const DENSITY = [0];

for (const [key, p] of Object.entries(PARTICLES)) {
    ID[key] = p.id;
    P[p.id] = p;
    CHARS[p.id] = p.char;
    KINDS[p.id] = p.kind;
    NAMES[p.id] = p.name;
    DENSITY[p.id] = p.density;
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
    setCell(x, y, ID[type]);
}

function setCell(x, y, type) {
    if (x < 0 || y < 0 || x >= world.width || y >= world.height) return;
    const i = idx(x, y);
    const prev = world.grid[i];
    if (prev === type) return;
    if (fuel) fuel[i] = 0;
    if (prev === 0) world.particleCount++;
    else if (type === 0) world.particleCount--;
    world.grid[i] = type;
}

function pushParticle(x, y, dx, dy) {
    const nx = x + dx;
    const ny = y + dy;

    if (!inb(x, y) || !inb(nx, ny)) return false;

    const from = idx(x, y);
    const to = idx(nx, ny);

    if (world.grid[from] === 0) return false;
    if (world.grid[to] !== 0 || moved[to]) return false;

    swap(from, to);
    return true;
}

const JITTER = 0.1;
var moved = null;
var fuel = null;

function inb(x, y) { return x >= 0 && y >= 0 && x < world.width && y < world.height; }
function at(x, y) { return inb(x, y) ? world.grid[idx(x, y)] : -1; }

const N4 = [[0, -1], [0, 1], [-1, 0], [1, 0]];
const N8 = [[0, -1], [0, 1], [-1, 0], [1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];

function nb(x, y) {
    const out = [];
    for (const [dx, dy] of N4) {
        const nx = x + dx, ny = y + dy;
        if (inb(nx, ny)) out.push([nx, ny, world.grid[idx(nx, ny)]]);
    }
    return out;
}

function arround8(x, y) {
    const out = [];
    for (const [dx, dy] of N8) {
        const nx = x + dx, ny = y + dy;
        if (inb(nx, ny)) out.push([nx, ny, world.grid[idx(nx, ny)]]);
    }
    return out;
}

function put(x, y, id) {
    setCell(x, y, id);
    if (inb(x, y)) moved[idx(x, y)] = 1;
}

function swap(i, j) {
    const g = world.grid, t = g[j];
    g[j] = g[i]; g[i] = t;
    moved[i] = moved[j] = 1;
}

function canEnter(type, x, y) {
    if (!inb(x, y)) return false;
    const i = idx(x, y);
    if (moved[i]) return false;
    const t = world.grid[i];
    if (t === 0) return true;
    const k = KINDS[t];
    if (k === SOLID || k === STATIC) return false;
    return KINDS[type] === GAS ? DENSITY[t] > DENSITY[type] : DENSITY[t] < DENSITY[type];
}

function slide(type, x, y, dir) {
    const max = P[type].disp || 10;
    for (let k = 1; k <= max; k++) {
        const tx = x + dir * k;
        if (!inb(tx, y) || world.grid[idx(tx, y)] !== 0) break;
        if (canEnter(type, tx, y + 1)) return tx;
    }
    return x;
}

// yes - ai did rewrite this function bc i had multiple errors in it and im too stupid for this
function moveFalling(x, y, i, type) {
    const g = world.grid;
    if (canEnter(type, x, y + 1)) return swap(i, idx(x, y + 1));

    const dl = canEnter(type, x - 1, y + 1) && (g[idx(x - 1, y + 1)] === 0 || Math.random() < 0.3);
    const dr = canEnter(type, x + 1, y + 1) && (g[idx(x + 1, y + 1)] === 0 || Math.random() < 0.3);
    if (dl || dr) {
        const nx = dl && dr ? (Math.random() < 0.5 ? x - 1 : x + 1) : (dl ? x - 1 : x + 1);
        return swap(i, idx(nx, y + 1));
    }
    if (KINDS[type] !== LIQUID) return;

    const l = slide(type, x, y, -1), r = slide(type, x, y, 1);
    let nx = x;
    if (l !== x && r !== x) {
        const a = x - l, b = r - x;
        nx = a === b ? (Math.random() < 0.5 ? l : r) : (a < b ? l : r);
    } else if (l !== x) nx = l;
    else if (r !== x) nx = r;
    else if (Math.random() < JITTER) {
        const jx = x + (Math.random() < 0.5 ? -1 : 1);
        if (inb(jx, y) && g[idx(jx, y)] === 0 && !moved[idx(jx, y)] && at(jx, y + 1) !== 0) nx = jx;
    }
    if (nx !== x) swap(i, idx(nx, y));
}

function moveGas(x, y, i, type) {
    if (Math.random() < 0.25) {
        const sx = x + (Math.random() < 0.5 ? -1 : 1);
        if (canEnter(type, sx, y)) return swap(i, idx(sx, y));
    }
    if (canEnter(type, x, y - 1)) return swap(i, idx(x, y - 1));
    const l = canEnter(type, x - 1, y - 1), r = canEnter(type, x + 1, y - 1);
    if (l || r) {
        const nx = l && r ? (Math.random() < 0.5 ? x - 1 : x + 1) : (l ? x - 1 : x + 1);
        return swap(i, idx(nx, y - 1));
    }
    const sx = x + (Math.random() < 0.5 ? -1 : 1);
    if (canEnter(type, sx, y)) swap(i, idx(sx, y));
}

/*
smoke - disappeers over time
steam - turns into water at a roof
lava - when in contact turns into another
    water -> steam
    sand -> glass
everything else thats not hard - burns
*/

const LAVA_EATS = Object.entries(PARTICLES)
    .filter(([key, p]) => (p.kind === SOLID || p.kind === STATIC) && !p.hard
        && !["sand", "snow", "ice"].includes(key))
    .map(([key]) => key);

const ACID_EATS = Object.entries(PARTICLES)
    .filter(([key, p]) => (p.kind === SOLID || p.kind === STATIC || p.kind === LIQUID)
        && !p.hard && key !== "acid" && key !== "lava")
    .map(([key]) => key);

function dissipate(x, y, chance = 0.015) {
    if (Math.random() < chance) put(x, y, 0);
}

function explode(x, y, r) {
    for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dy * dy > r * r) continue;
            const nx = x + dx, ny = y + dy;
            const t = at(nx, ny);
            if (t === -1) continue;                         // out of bounds
            if (t !== 0 && P[t].hard && t !== ID.fire) continue; // walls survive
            put(nx, ny, Math.random() < 0.5 ? ID.fire : ID.smoke);
        }
    }
}

const REACTIONS = {
    smoke(x, y) {
        dissipate(x, y);
    },
    fumes(x, y) {
        dissipate(x, y, 0.010);
    },
    steam(x, y) {
        // turns into water at the roof
        if (!canEnter(ID.steam, x, y - 1) && Math.random() < 0.006) put(x, y, ID.water);
    },
    lava(x, y) {
        const select = ["water", "sand", "acid", "snow", "ice", ...LAVA_EATS];
        const filtered = {};
        for (const name of select) filtered[name] = [];

        for (const [nx, ny, id] of nb(x, y)) {
            for (const name of select) {
                if (id === ID[name]) filtered[name].push([nx, ny]);
            }
        }

        for (const [xS, yS] of filtered.water) {
            if (Math.random() < 0.05) {
                put(xS, yS, ID.steam);
                if (Math.random() < 0.3) put(x, y, ID.obsidian);
            }
        }

        for (const [xS, yS] of filtered.snow) {
            if (Math.random() < 0.05) {
                put(xS, yS, ID.water);
                if (Math.random() < 0.3) put(x, y, ID.obsidian);
            }
        }

        for (const [xS, yS] of filtered.ice) {
            if (Math.random() < 0.05) {
                put(xS, yS, ID.water);
                if (Math.random() < 0.3) put(x, y, ID.obsidian);
            }
        }

        for (const [xS, yS] of filtered.sand) {
            if (Math.random() < 0.01) put(xS, yS, ID.glass);
        }

        for (const [xS, yS] of filtered.acid) {
            if (Math.random() < 0.1) {
                put(xS, yS, ID.fumes);
                if (Math.random() < 0.3) put(x, y, ID.obsidian);
            }
        }

        for (const name of LAVA_EATS) {
            for (const [xS, yS] of filtered[name]) {
                if (Math.random() < 0.05) {
                    if (Math.random() < 0.2) {
                        put(xS, yS, ID.fire);
                    } else {
                        put(xS, yS, ID.smoke);
                    }
                    if (Math.random() < 0.3) {
                        put(x, y, ID.obsidian);
                    }
                }
            }
        }
    },
    acid(x, y) {
        const select = ["water", ...ACID_EATS];

        const filtered = {};
        for (const name of select) filtered[name] = [];

        for (const [nx, ny, id] of nb(x, y)) {
            for (const name of select) {
                if (id === ID[name]) filtered[name].push([nx, ny]);
            }
        }

        for (const name of ACID_EATS) {
            for (const [xS, yS] of filtered[name]) {
                if (Math.random() < 0.05) {
                    put(xS, yS, ID.smoke);

                    if (Math.random() < 0.5) {
                        put(x, y, ID.fumes);
                    }
                }
            }
        }
    },
    fire(x, y) {
        const i = idx(x, y);

        for (const [nx, ny, id] of arround8(x, y)) {
            if (id === 0) continue;

            if (id === ID.water) {
                put(nx, ny, ID.steam);
                put(x, y, 0);
                return;
            } else if (id === ID.snow || id === ID.ice) {
                if (Math.random() < 0.15) {
                    put(nx, ny, ID.water);
                    put(x, y, 0);
                    return;
                }
                continue;
            } else if (id === ID.acid) {
                put(x, y, ID.fumes);
                return;
            }

            const boom = P[id].boom;
            if (boom) {
                explode(nx, ny, boom);
                return;
            }

            const flam = P[id].flam;
            if (flam && Math.random() < flam) {
                put(nx, ny, ID.fire);
                fuel[idx(nx, ny)] = id;
            }
        }

        if (at(x, y - 1) === 0 && Math.random() < 0.1) put(x, y - 1, ID.smoke);

        const chance = P[fuel[i]]?.burnOutChance ?? P[ID.fire].burnOutChance;
        if (Math.random() < chance) {
            const f = fuel[i];
            const solidFuel = f && (KINDS[f] === SOLID || KINDS[f] === STATIC);
            if (f === ID.plant) {
                if (Math.random() < 0.2) {
                    put(x, y, ID.seed);
                    fuel[i] = 0;
                } else if (Math.random() < 0.7) {
                    put(x, y, ID.petal);
                    fuel[i] = 0;
                }
            } else {
                if (solidFuel) put(x, y, Math.random() < 0.5 ? ID.ash : ID.smoke);
                else           put(x, y, Math.random() < 0.5 ? ID.smoke : 0);
                fuel[i] = 0;
            }
        }
    },
    burner(x, y) {
        for (const [nx, ny, id] of nb(x, y)) {
            if (id === 0) continue;
            const target = P[id];
            const flam = P[id].flam;
            if (target && !target.hard) {
                if (flam && Math.random() < flam) {
                    if (id === ID.plant) {
                        if (Math.random() < 0.2) {
                            put(nx, ny, ID.seed);
                        } else if (Math.random() < 0.7) {
                            put(nx, ny, ID.petal);
                        }
                    } else {
                        put(nx, ny, 0);
                    }
                }
            }
        }
    },
    plant(x, y) {
        const water = nb(x, y).find(([, , id]) => id === ID.water);
        if (!water) return;

        if (Math.random() > 0.15) return;

        const free = (px, py) => at(px, py) === 0 && !moved[idx(px, py)];

        const side = (dir) => (Math.random() < 0.1 ? dir * 2 : dir);
        const l = side(-1), r = side(1);

        const up = [[0, -1]];
        const diagonals = [[l, -1], [r, -1]];
        const sideways = [[l, 0], [r, 0]];

        const options = [...up, ...diagonals, ...sideways]
            .filter(([dx, dy]) => free(x + dx, y + dy));
        if (options.length === 0) return;

        let pick;
        if (free(x, y - 1) && Math.random() < 0.6) pick = [0, -1];
        else pick = options[Math.floor(Math.random() * options.length)];

        const tx = x + pick[0], ty = y + pick[1];
        put(tx, ty, ID.plant);
        put(water[0], water[1], 0);

        if (Math.random() < 0.2 && free(tx, ty - 1)) {
            put(tx, ty - 1, ID.plant);
        }
    },
    seed(x, y) {
        for (const [nx, ny, id] of nb(x, y)) {
            if (id === ID.dirt) {
                if (Math.random() < 0.02) {
                    put(x, y, ID.plant);
                    return;
                }
            }
        }
    },
    freezer(x, y) {
        for (const [nx, ny, id] of nb(x, y)) {
            if (Math.random() < 0.005) {
                if (id === ID.water) {
                    put(nx, ny, ID.ice);
                } else if (id === ID.fire) {
                    put(nx, ny, 0); // extinguish fire
                } else if (id === ID.steam) {
                    put(nx, ny, ID.water);
                }
            }
        }
    },
};

var REACTIONS_ID = {};
for (const [key, fn] of Object.entries(REACTIONS)) REACTIONS_ID[ID[key]] = fn;

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
}

var selectedTab = "ground";
var selectedItem = SECTIONS[selectedTab].items[0];

function cycleTab(dir) {
    const keys = Object.keys(SECTIONS);
    const i = (keys.indexOf(selectedTab) + dir + keys.length) % keys.length;
    selectedTab = keys[i];
    selectedItem = SECTIONS[selectedTab].items[0];
}

function cycleItem(dir) {
    const items = SECTIONS[selectedTab].items;
    const i = (items.indexOf(selectedItem) + dir + items.length) % items.length;
    selectedItem = items[i];
}

const stripAnsi = s => s.replace(/\x1b\[[0-9;]*m/g, '');

function handleInfoClick(x, y) {
    if (isConfirming()) return;

    if (y === 1) {
        let pos = 0;
        for (const [key, sec] of Object.entries(SECTIONS)) {
            const w = sec.name.length;
            if (x >= pos && x < pos + w) {
                selectedTab = key;
                selectedItem = SECTIONS[key].items[0];
                return;
            }
            pos += w + 1;
        }
    } else if (y === 2) {
        let pos = 0;
        for (const item of SECTIONS[selectedTab].items) {
            const w = stripAnsi(NAMES[ID[item]]).length;
            if (x >= pos && x < pos + w) {
                selectedItem = item;
                return;
            }
            pos += w + 1;
        }
    }
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

    onInfoClick(handleInfoClick);
    onWorldClick((x, y) => {
        createParticle(x, y, selectedItem);
        cursorX = x;
        cursorY = y;
        updateDisplay();
    })

    registerKeyListener(['escape', 'q'], () => {
        saveGame();
        process.exit(0);
    });

    registerKeyListener(['p', 'P'], () => {
        world.paused = !world.paused;
        updateDisplay();
    });

    registerKeyListener(['w'], () => {
        if (cursorY > 0) {
            cursorY--;
        }
    });

    registerKeyListener(['s'], () => {
        if (cursorY < world.height-1) {
            cursorY++;
        }
    });

    registerKeyListener(['a'], () => {
        if (cursorX > 0) {
            cursorX--;
        }
    });

    registerKeyListener(['r'], () => {
        askConfirm("Clear the world? (y/n)", () => {
            world.grid.fill(0);
            world.particleCount = 0;
            if (fuel) fuel.fill(0);
            updateDisplay();
            saveGame();
        });
    });


    registerKeyListener(['d'], () => {
        if (cursorX < world.width-1) {
            cursorX++;
        }
    });

    registerKeyListener(['+'], () => cycleTab(1));
    registerKeyListener(['='], () => cycleTab(1));
    registerKeyListener(['-'], () => cycleTab(-1));
    registerKeyListener(['_'], () => cycleTab(-1));
    registerKeyListener([','], () => cycleTab(-1));
    registerKeyListener(['.'], () => cycleTab(1));
    registerKeyListener(['>'], () => cycleTab(1));
    registerKeyListener(['<'], () => cycleTab(-1));
    registerKeyListener(['['], () => cycleItem(-1));
    registerKeyListener([']'], () => cycleItem(1));
    registerKeyListener(['left'], () => cycleItem(-1));
    registerKeyListener(['right'], () => cycleItem(1));

    registerKeyListener(['n'], () => { step(); updateDisplay(); });

    registerKeyListener(['space'], () => {
        createParticle(cursorX, cursorY, selectedItem);
        updateDisplay();
    });

    registerKeyListener(['enter'], () => {
        createParticle(cursorX, cursorY, selectedItem);
        updateDisplay();
    });

    setInterval(saveGame, 5 * 1000);
    setInterval(gameLoop, 1000/FPS);
}

function saveGame() {
    saveWorld(world.name, world);
}

var tick = 0;

function step() {
    const { width, height, grid } = world;

    if (!moved || moved.length !== grid.length) moved = new Uint8Array(grid.length);
    else moved.fill(0);

    if (!fuel || fuel.length !== grid.length) fuel = new Uint8Array(grid.length);

    const leftToRight = (tick++ % 2 === 0);
    for (let y = height - 1; y >= 0; y--) {
        for (let n = 0; n < width; n++) {
            const x = leftToRight ? n : width - 1 - n;
            const i = idx(x, y);
            if (moved[i]) continue;
            const type = grid[i];
            if (type === 0) continue;
            const p = P[type];
            if (!p) continue;

            if (p.emit && at(x, y + 1) === 0 && Math.random() < (p.rate ?? 0.5)) put(x, y + 1, ID[p.emit]);

            if (p.drain) {
                for (const [nx, ny, id] of nb(x, y)) {
                    if (id === 0) continue;
                    const target = P[id];
                    if (target.hard) continue;
                    if (p.drainType && !p.drainType(target)) continue;
                    if (Math.random() < (p.rate ?? 0.5)) put(nx, ny, 0);
                }
            }

            if (p.direction) {
                const [dx, dy] = p.direction;
                const aboveX = x;
                const aboveY = y - 1;

                if (inb(aboveX, aboveY)) {
                    const aboveI = idx(aboveX, aboveY);
                    const particleId = grid[aboveI];

                    if (particleId !== 0 && !moved[aboveI]) {
                        const targetX = x + dx;
                        const targetY = y + dy - 1;

                        if (inb(targetX, targetY)) {
                            const targetI = idx(targetX, targetY);
                            
                            if (grid[targetI] === 0 && !moved[targetI]) {
                                grid[targetI] = particleId;
                                grid[aboveI] = 0;
                                
                                moved[targetI] = 1;
                                moved[aboveI] = 1;
                            }
                        }
                    }
                }          
            }

            if (REACTIONS_ID[type]) {
                REACTIONS_ID[type](x, y);
                if (moved[i] || grid[i] !== type) continue;
            }

            const kind = KINDS[type];
            if (kind === STATIC) continue;
            if (p.speed && Math.random() > p.speed) continue;

            if (kind === GAS) moveGas(x, y, i, type);
            else moveFalling(x, y, i, type);
        }
    }
}

function gameLoop() {
    if (!world.paused && !isConfirming()) step();
    updateDisplay();
    updateInfo(
        `Particles: ${world.particleCount} | ${world.paused ? "Paused" : "Running"}\n` +
        Object.entries(SECTIONS)
            .map(([key, sec]) => key === selectedTab ? chalk.bgCyan(sec.name) : sec.name)
            .join(" ") + "\n" +
        SECTIONS[selectedTab].items
            .map(item => {
                const name = NAMES[ID[item]];
                return item === selectedItem ? chalk.bgGreen(name) : name;
            })
            .join(" ") + "\n" +
        `${chalk.underline("Q")}uit ${chalk.underline("P")}ause/play ${chalk.underline("R")}eset\nWASD to move, < and > to select tabs, Arrow keys to select items`
    );
    render();
}

export { initGame };