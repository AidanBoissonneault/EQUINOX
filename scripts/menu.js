// --------------------- MULTIPLAYER SCREEN -------------------------------------------

function multiplayerScreen() {
    //document.getElementById("title-screen").className = "screen";
    //document.getElementById("multiplayer-screen").className = "active";
    loadPageFragment("multiplayerScreen.html");

    isMultiplayer = true;
}

// ------------------ SETTINGS SCREEN -------------------------------------------------

function settings() {

}

// ----------------------- INSTRUCTIONS SCREENS ---------------------------------------

function instructions() {
    const WINDOW_SIZE = { w: 400, h: 500 };
    const WINDOW_LOCATION = { left: (screen.width - WINDOW_SIZE.w) / 2, top: (screen.height - WINDOW_SIZE.h) / 2 };
    window.open(
        "./html/instructionsPage.html",
        "instrWindow",
        `width=${WINDOW_SIZE.w}, height=${WINDOW_SIZE.h},
        left=${WINDOW_LOCATION.left}, top=${WINDOW_LOCATION.top},
        toolbar=no,status=no`
    )
}