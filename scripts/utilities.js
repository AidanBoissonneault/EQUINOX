function delay(ms, noGameSpeedModifier = false) {
    const usedGameSpeed = noGameSpeedModifier ? 1 : settings.gameSpeed;
    return new Promise(resolve => setTimeout(resolve, ms / usedGameSpeed));
}

function playSound(soundFile) {
    soundFile.pause();
    soundFile.currentTime = 0;
    soundFile.volume = settings.volume;
    soundFile.play();
}

//loads a screen
const NO_GAME_SPEED_MODIFER = true;
async function loadPageFragment(file, documentId = "actual-body", transition = true) {

    const cardTransition = document.getElementById("card-transition");

    if (!settings.noTransitionScreen && transition) {
        cardTransition.classList.remove("active", "exit", "reset");
        await new Promise(requestAnimationFrame);
        cardTransition.classList.add("active");
        await delay(300, NO_GAME_SPEED_MODIFER);
    }

    const PATH = "./html/";
    const fileObject = await fetch(PATH+file);
    const html = await fileObject.text();
    document.getElementById(documentId).innerHTML = html;

    //add functionality to the absolute buttons
    addAbsoluteButtonEventListeners();
    addHelpButtonEventListeners();

    if (file === "multiplayerScreen.html") { document.getElementById("start-button").disabled = true; }

    if (!settings.noTransitionScreen && transition) {
        //slide card transtion
        cardTransition.classList.add("exit");
        cardTransition.classList.remove("active");

        await delay(300, NO_GAME_SPEED_MODIFER);
        // Make the card invisible and reset
        cardTransition.classList.remove("exit");
        cardTransition.classList.add("reset");
    }
}

loadPageFragment("titleScreen.html");