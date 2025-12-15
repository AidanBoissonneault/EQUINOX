import { gameState } from "../gameState/gameState.js"

export function addUndoEventListener() {
    const undoButton = document.getElementById("undo-button");
    if (!undoButton) return;

    undoButton.addEventListener("click", () => {
        gameState.knight.undo();
    });
    document.addEventListener("keydown", event => {

        //does not allow keydown whilst an overlay screen is displayed
        const overlayScreen = document.getElementById("overlay-screen-container");
        if (!overlayScreen) throw new Error("cannot process U input because no overlay screen was found");
        if (!overlayScreen.classList.contains("no-display")) throw new Error("cannot press U input while an overlay screen is being displayed");

        //undo knight move
        if (event.key === "u")
            gameState.knight.undo();
    });
}