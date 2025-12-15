import { Tile, tileState } from "../tileLogic/tile.js";
import { knightMoveReference } from "../knight/knight.js";
import { gameState } from "../gameState/gameState.js";

export function checkNextMove(tile, returnState) {
    if (! (tile instanceof Tile)) 
        throw new Error("tile must be of a Tile class");
    //add new next moves
    const moveTheKnight = () => {
        if (tile.state === tileState.VISITING) return;
        if (tile.state !== tileState.UNVISITED) throw new Error("a knight cannot revisit a spot on the board");
        gameState.knight.move(tile.x, tile.y); 
    }
    if (isInMoves(tile)) {
        tile.visual.documentId.classList.add("next-move");

        tile.visual.documentId.removeEventListener("click", moveTheKnight);
        tile.visual.documentId.addEventListener("click", moveTheKnight, { once: true });

        returnState = true;
    }  else {
        tile.visual.documentId.removeEventListener("click", moveTheKnight);
    }

    //communicates if a new move was found
    if (returnState) return true;
    return false;
}

function isInMoves(tile) {
    for (const [dx, dy] of knightMoveReference) {
        if (gameState.knight.x + dx === tile.x &&
            gameState.knight.y + dy === tile.y &&
            tile.state === tileState.UNVISITED) {

            return true;
        }
    }
    return false;
}