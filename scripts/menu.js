// --------------------- MULTIPLAYER SCREEN -------------------------------------------

function multiplayerScreen() {
    //document.getElementById("title-screen").className = "screen";
    //document.getElementById("multiplayer-screen").className = "active";
    loadPageFragment("multiplayerScreen.html");

    isMultiplayer = true;
}

// ------------------ SETTINGS SCREEN -------------------------------------------------

const settings = {
    highContrast: true,
    autoDraw: true,
    optimizedDiscardPile: false,
    lastLoadedPage: ""
};

async function settingsLoad(origin, documentId = "actual-body") {
    if (origin === "mainGame.html") { documentId = "settings-overlay"; }
    await loadPageFragment("settings.html", documentId);
    settings.lastLoadedPage = origin;

    if (settings.highContrast === true) { document.getElementById("high-contrast-toggle").checked = true; }
    if (settings.autoDraw === true) { document.getElementById("auto-draw").checked = true; }
}

function changeSetting(settingsObject) {
    const OUTPUT_STATE = settingsObject.checked;

    switch(settingsObject.id) {
        case "high-contrast-toggle": settings.highContrast = OUTPUT_STATE; return;
        case "auto-draw": settings.autoDraw = OUTPUT_STATE; return;
    }
}

function exitSettings() {
    loadPageFragment(settings.lastLoadedPage);

    document.getElementById("actual-body").className = settings.highContrast === true ? "high-contrast" : "";
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