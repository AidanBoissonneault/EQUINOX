import { gameState } from "./gameState.js";
import { tileState } from "../tileLogic/tile.js";
import { loadPageFragment } from "../utilities/loadPageFragment.js";
import { addWinScreenEventListeners } from "../eventHandlers/winScreen.js";

export function checkWin(skipX, skipY) {
    for (const column of gameState.tileMap) {
        for (const tile of column) {
            if (tile.state === tileState.UNVISITED && tile.x !== skipX && tile.y !== skipY) {
                console.log(`No win because of X${tile.x} Y${tile.y}`);
                return false;
            }
        }
    }
    return true;
}

export async function winGame() {
    await loadPageFragment("overlay-screens/win.html", "overlay-screen-container");
    addWinScreenEventListeners();
}

export function simplifiedCheckWin() {
    const visitedTiles = document.querySelectorAll(".visited, .visiting");
    if (visitedTiles.length >= gameState.boardSize ** 2)
        return true;
    return false;
}