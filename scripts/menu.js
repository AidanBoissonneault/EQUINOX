// --------------------- MULTIPLAYER SCREEN -------------------------------------------

async function multiplayerScreen() {
    //document.getElementById("title-screen").className = "screen";
    //document.getElementById("multiplayer-screen").className = "active";
    settings.lastLoadedPage = "titleScreen.html";
    await loadPageFragment("multiplayerScreen.html");
    document.getElementById("start-button").disabled = true;
    document.getElementById("start-button").innerHTML = "awaiting connection...";

    isMultiplayer = true;
}

// ------------------ SETTINGS SCREEN -------------------------------------------------

//stored settings for the entire game
const settings = {
    highContrast: true,
    autoDraw: true,
    optimizedDiscardPile: false,
    optimizedMainHand: false,
    noTransitionScreen: false,
    lastLoadedPage: "",
    volume: 1,
    gameSpeed: 1,
    showHelpButton: true
};

const IGNORE_TRANSITION_SCREEN = false;
async function settingsLoad(origin, documentId = "actual-body", transition = true) {
    await loadPageFragment("settings.html", documentId, transition);
    if (origin === "mainGame.html") { 
        document.getElementById("settings-screen").className = "active title-screen";
        document.getElementById("settings-overlay").classList.add("events-activated");

        document.getElementById("optimized-discard").disabled = true;
        document.getElementById("optimized-hand").disabled = true;
     }
    settings.lastLoadedPage = origin;

    if (settings.highContrast === true) { document.getElementById("high-contrast-toggle").checked = true; }
    if (settings.autoDraw === true) { document.getElementById("auto-draw").checked = true; }
    if (settings.optimizedDiscardPile === true) { document.getElementById("optimized-discard").checked = true; }
    if (settings.optimizedMainHand === true) { document.getElementById("optimized-hand").checked = true; }
    if (settings.noTransitionScreen === true) { document.getElementById("no-transition-screen").checked = true; }
    if (settings.showHelpButton === true) { document.getElementById("show-help-button").checked = true; }
    document.getElementById("volume-slider").value = Math.floor(settings.volume * 100);
    document.getElementById("game-speed-text").innerHTML = settings.gameSpeed;
}

function changeSetting(settingsObject) {
    const OUTPUT_STATE = settingsObject.checked;

    switch(settingsObject.id) {
        case "high-contrast-toggle": 
            settings.highContrast = OUTPUT_STATE; 
            document.getElementById("actual-body").className = OUTPUT_STATE ? "high-contrast" : "";
            return;
        case "auto-draw": settings.autoDraw = OUTPUT_STATE; return;
        case "optimized-discard": settings.optimizedDiscardPile = OUTPUT_STATE; return;
        case "optimized-hand": settings.optimizedMainHand = OUTPUT_STATE; return;
        case "no-transition-screen": settings.noTransitionScreen = OUTPUT_STATE; return;
        case "show-help-button":
            settings.showHelpButton = OUTPUT_STATE;
            const helpContainer = document.getElementById("help-container");
            if (settings.lastLoadedPage === "mainGame.html") 
                helpContainer.classList.toggle("no-display");
            return;
    }
}

const GAME_SPEEDS = [ 0.5, 1, 1.5, 2, 2.5, 4, 8, 16, 32, 1000 ];
const DOWN_IN_SPEED = -1;
const UP_IN_SPEED = 1;
function changeGameSpeed(direction) {
    const currentIndex = GAME_SPEEDS.findIndex(goal => goal === settings.gameSpeed);
    const nextIndex = (currentIndex + direction + GAME_SPEEDS.length) % GAME_SPEEDS.length;

    settings.gameSpeed = GAME_SPEEDS[nextIndex];
    document.documentElement.style.setProperty('"--gameSpeed"', settings.gameSpeed);

    document.getElementById("game-speed-text").innerHTML = settings.gameSpeed;
}

async function exitSettings() {
    //sets the volume from the slider to the game
    settings.volume = document.getElementById("volume-slider").value / 100;
    if (settings.lastLoadedPage !== "mainGame.html") {
        await loadPageFragment(settings.lastLoadedPage);
    } else {
        document.getElementById("settings-overlay").classList.remove("events-activated");
        document.getElementById("settings-overlay").innerHTML = "";
    }
}

// ----------------------- EXIT MULTIPLAYER SCREEN ---------------------------------------

async function exitMultiplayerScreen() {
    await loadPageFragment("titleScreen.html");
    if (conn == undefined)  {
        isMultiplayer = false;
        console.log("multiplayer disabled");
    }
}

// ----------------------- INSTRUCTIONS SCREEN ---------------------------------------

function instructions() {
    const WINDOW_SIZE = { w: 400, h: 500 };
    const WINDOW_LOCATION = { left: (screen.width - WINDOW_SIZE.w) / 2, top: (screen.height - WINDOW_SIZE.h) / 2 };
    window.open(
        "./html/instructionsPage.html",
        "instructionWindow",
        `width=${WINDOW_SIZE.w}, height=${WINDOW_SIZE.h},
        left=${WINDOW_LOCATION.left}, top=${WINDOW_LOCATION.top},
        toolbar=no,status=no`
    )
}

// ---------------------- HELP BUTTON --------------------------------------------------

const IGNORE_AUTO_DRAW = true;
async function helpButton(isSecondaryMultiplayer = false) {
    
    if (isMultiplayer && !isSecondaryMultiplayer) {
        conn.send({ type: 'helpButtonPressed' });
    }

    //clears out currently selected cards
    const hand = currentGameState[currentPlayer] === State.STANDARD ? playerStandardHand : playerInvertedHand;
    while (currentSelectedCards.length > 0) {
        const selectedCard = currentSelectedCards.pop();
        const index = hand.indexOf(selectedCard);

        const cardHTML = document.querySelector(`[data-index='${index}']`);
        if (cardHTML) {
            cardHTML.classList.remove("playing-card-selected");
            cardHTML.classList.add("playing-card");
        }
    }

    await delay(100); //delay so the game visually updates

    //select the new cards
    autoSelectCards(IGNORE_AUTO_DRAW);
}