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
    lastLoadedPage: "",
    volume: 0.5,
    gameSpeed: 1
};

async function settingsLoad(origin, documentId = "actual-body") {
    if (origin === "mainGame.html") { documentId = "settings-overlay"; }
    await loadPageFragment("settings.html", documentId);
    settings.lastLoadedPage = origin;

    if (settings.highContrast === true) { document.getElementById("high-contrast-toggle").checked = true; }
    if (settings.autoDraw === true) { document.getElementById("auto-draw").checked = true; }
    if (settings.optimizedDiscardPile === true) { document.getElementById("optimized-discard").checked = true; }
    if (settings.optimizedMainHand === true) { document.getElementById("optimized-hand").checked = true; }
    document.getElementById("game-speed-text").innerHTML = settings.gameSpeed;
}

function changeSetting(settingsObject) {
    const OUTPUT_STATE = settingsObject.checked;

    switch(settingsObject.id) {
        case "high-contrast-toggle": settings.highContrast = OUTPUT_STATE; return;
        case "auto-draw": settings.autoDraw = OUTPUT_STATE; return;
        case "optimized-discard": settings.optimizedDiscardPile = OUTPUT_STATE; return;
        case "optimized-hand": settings.optimizedMainHand = OUTPUT_STATE; return;
    }
}

const GAME_SPEEDS = [ 0.5, 1, 2, 4, 8, 16, 32, 1000 ];
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
    await loadPageFragment(settings.lastLoadedPage);

    document.getElementById("actual-body").className = settings.highContrast === true ? "high-contrast" : "";
    if (conn == undefined)  {
        isMultiplayer = false; //stored in here because function is reused in multiplayer screen. this will need limitations for if a game is currently connected.
        console.log("multiplayer disabled");
    }
}

// ----------------------- INSTRUCTIONS SCREENS ---------------------------------------

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