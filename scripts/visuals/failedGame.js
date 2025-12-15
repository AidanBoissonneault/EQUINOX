import { gameState } from "../gameState/gameState.js";
import { tileState } from "../tileLogic/tile.js";
import { delay } from "../utilities/delay.js";

export function setRemainingTilesFail() {
    gameState.tileMap.forEach(col => {
        col.forEach(tile => {
            if (tile.state === tileState.UNVISITED) {
                let theDelay =  1 + Math.random() * 4;

                explodeElement(tile, theDelay);
                tile.visual.documentId.classList.add("failed");

                tile.visual.documentId.addEventListener("transitionstart", async () => {
                    await delay(theDelay * 1000);

                    if (tile.visual.documentId.classList.contains("failed")) //checks in case the failed type was destructed during the delay
                        tile.visual.documentId.classList.add("failed-falling");
                }, { once: true } );
            }
        });
    });
}

export function removeFailedTiles() {
    const failedTiles = document.querySelectorAll(".failed");
    if (!failedTiles) return;

    failedTiles.forEach(failedTile => {
        failedTile.classList.remove("failed", "failed-falling");
    });
}

function explodeElement(tile, theDelay) {
    // random direction + distance
    const angle = Math.random() * Math.PI * 2;
    const distance = 300 + Math.random() * 300;

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    tile.visual.documentId.style.setProperty("--movedX", x);
    tile.visual.documentId.style.setProperty("--movedY", y);
    tile.visual.documentId.style.setProperty("--duration", theDelay);
}
