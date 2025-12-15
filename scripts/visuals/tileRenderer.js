import { gameState } from "../gameState/gameState.js";
import { generateMap } from "../tileLogic/gridGenerator.js";
import { visualTileDimensions } from "./tileVisual.js";
import { tileState } from "../tileLogic/tile.js";
import { checkNextMove } from "./nextMoves.js";

export function resetBoard() {
    const boardId = "board";
    const board = document.getElementById(boardId);
    if (!board) throw new Error(`${boardId} id in the document does not exist`);
    board.innerHTML =   `<div id="knight">
                            <img src="./assets/knight.png" alt="" id="knight-image">
                        </div>`;
}

export function renderBoard() {
    //if (gameState.tileMap == null) {
        gameState.tileMap = generateMap(gameState.boardSize);
    //}

    const boardId = "board";
    const board = document.getElementById(boardId);
    if (!board) throw new Error(`${boardId} id in the document does not exist`);

    board.style.width = `${gameState.boardSize * visualTileDimensions.sizeX}px`;
    board.style.height = `${gameState.boardSize * visualTileDimensions.sizeY}px`;

    renderTiles();
}

export function renderTiles() {
    let hasNextMoves = false;
    let counter = 0; //counter for z-index
    gameState.tileMap.forEach(col => {
        col.forEach(tile => {
            const existingDocumentId = document.getElementById(`tileX${tile.x}Y${tile.y}`);
            if (!existingDocumentId) {
                board.insertAdjacentHTML("beforeend", `
                    <div class="tile"
                        style="--x:${tile.visual.offsetX}; --y:${tile.visual.offsetY};
                        --sizeX:${visualTileDimensions.sizeX}; --sizeY:${visualTileDimensions.sizeY};
                        --colorScheme:${tile.visual.colorScheme}; --colorSchemeSecondary:${tile.visual.colorSchemeSecondary};
                        z-index: ${counter}"
                        data-xLogical="${tile.x}" 
                        data-yLogical="${tile.y}" 
                        id="tileX${tile.x}Y${tile.y}"
                    </div>
                `);
                counter ++;    

                tile.visual.documentId = document.getElementById(`tileX${tile.x}Y${tile.y}`);
            } else {
                tile.visual.documentId.classList.remove("next-move"); //resets the next move if its not generating a tile
            }
            hasNextMoves = checkNextMove(tile, hasNextMoves);
            /*tile.visual.documentId.addEventListener("click", () => {
                knight.move(tile.x, tile.y);
            }); moved to nextMoves.js */
        });
    });
    gameState.tileMap[gameState.knight.x][gameState.knight.y].state = tileState.VISITING;

    return hasNextMoves;
}