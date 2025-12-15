import { GameController } from "../gameState/gameController.js";

export function addFailScreenEventListeners() {
    const tryAgainId = "try-again-button";
    const tryAgain = document.getElementById(tryAgainId);
    if (!tryAgain) throw new Error(`cannot add event handler to non existent button ${tryAgainId}`);

    tryAgain.addEventListener("click", () => {
        GameController.startGame();
    });
}