import { addFailScreenEventListeners } from "../eventHandlers/failScreen.js";
import { loadPageFragment } from "../utilities/loadPageFragment.js";
import { setRemainingTilesFail } from "../visuals/failedGame.js";
import { simplifiedCheckWin } from "./winGame.js";

export async function endGame() {
    if (simplifiedCheckWin()) return; //avoids losing and winning at the same time
    setRemainingTilesFail();
    await loadPageFragment("overlay-screens/fail.html", "overlay-screen-container");
    addFailScreenEventListeners();
}