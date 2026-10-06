import { saveWorld } from "./worlds.js";

const FPS = 60;

var mainScreen = null;
var world = null;

function initGame(gui, w) {
    mainScreen = gui;
    world = w;

    if (!world.grid) {

    }

    setInterval(saveGame, 30 * 1000);
    setInterval(gameLoop, 1000/60);
}

function saveGame() {
    saveWorld(world.name, world);
}

function gameLoop() {

}

export { initGame };