import { GameController } from "../gameState/gameController.js";
import { addFailScreenEventListeners } from "./failScreen.js";

export function addWinScreenEventListeners() {
    const incrementId = "increment-button";
    const increment = document.getElementById(incrementId);
    if (!increment) throw new Error(`cannot add event handler to non existent button ${incrementId}`);

    increment.addEventListener("click", () => {
        GameController.incrementBoardSize();
        GameController.startGame();
    });

    addFailScreenEventListeners(); //adds the try-again button (replay)
}