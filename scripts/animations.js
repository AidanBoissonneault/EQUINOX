async function buttonFlashRed(buttonId) {
    document.getElementById(buttonId).classList.add("flash");
    await delay(400);
    document.getElementById(buttonId).classList.remove("flash");
}

let isScreenShakeRunning = false;
let shakeIntensity = 0;
const SHAKE_INTENSITY_MULTIPLIER = 30;
const SHAKE_DURATION_DEFAULT = 200;

async function animateScreenShake() {
    //adds screenshake
    shakeIntensity += SHAKE_INTENSITY_MULTIPLIER;
    animateScreenShakeZoom();

    if (!isScreenShakeRunning) {
        isScreenShakeRunning = true;
        const bodyHTML = document.getElementById("actual-body");

        bodyHTML.style.setProperty("--intensity", shakeIntensity);
        bodyHTML.style.setProperty("--duration", SHAKE_DURATION_DEFAULT);

        bodyHTML.classList.add("screen-shake");

        await delay(SHAKE_DURATION_DEFAULT);

        bodyHTML.classList.remove("screen-shake");
        shakeIntensity = 0;
        isScreenShakeRunning = false;
    }
}

let isScreenShakeZoomRunning = false; //if a zoom-out is actively happening
let zoomAmount = 1; //starting amount, modifies
const ZOOM_STEP = 0.1; //max zoom in amount
const ZOOM_ONE_MAX = 1 + ZOOM_STEP;
const ZOOM_MIN = 1;
const ZOOM_TIME = 200; //max time in ms from ZOOM_MAX to 1

const ZOOM_ROTATE_AXIS = 0.5; //max different in degrees
async function animateScreenShakeZoom() {
    const bodyHTML = document.getElementById("actual-body");

    zoomAmount += ZOOM_STEP;
    const ZOOM_INCREMENT = ZOOM_ONE_MAX / (ZOOM_TIME / settings.gameSpeed);

    let rotateAmount = Math.random() * (ZOOM_ROTATE_AXIS * 2) - ZOOM_ROTATE_AXIS; 
    const ROTATE_INCREMENT = (0 - rotateAmount) / (ZOOM_TIME / settings.gameSpeed);

    if (!isScreenShakeZoomRunning) {
        isScreenShakeZoomRunning = true;

        while (zoomAmount > ZOOM_MIN) {
            bodyHTML.style.setProperty("--zoom", zoomAmount);
            zoomAmount -= ZOOM_INCREMENT;

            bodyHTML.style.setProperty("--rotate", rotateAmount);
            rotateAmount -= ROTATE_INCREMENT;
            await delay(1);
        }

        //reset in case of float point math being non-precise.
        bodyHTML.style.setProperty("--zoom", 1);
        bodyHTML.style.setProperty("--rotate", 0);
        isScreenShakeZoomRunning = false;
    }
}


// Played cards moving

const DELAY_BETWEEN_CARDS_MOVING = 125;
const DELAY_PERFECT_PLAY_MULTIPLIER = 2;
async function animateSelectedCards(isPerfectPlay) {
    const hand = currentGameState[currentPlayer] == State.STANDARD ? playerStandardHand : playerInvertedHand;

    setVisualSelectedCard("noCard");

    for (let playedCard of currentSelectedCards) {
        const index = hand.indexOf(playedCard);
        console.log("index: " + index);
        if (index !== -1) {
            const cardHTML = document.querySelector(`[data-index='${index}']`);

            //fixes visuals
            cardHTML.classList.remove("playing-card-selected");
            cardHTML.classList.add("playing-card");
            cardHTML.classList.add("move-under-screen");

            playSound(audioPlayCard);
        }
        await delay(DELAY_BETWEEN_CARDS_MOVING);
    }

    await delay(DELAY_BETWEEN_CARDS_MOVING*2);

    for (let i = currentSelectedCards.length-1; i >= 0; i--) {
        if (currentGameState[currentPlayer] === State.STANDARD) {
            currentStPlayingCard = currentSelectedCards[i];
        } else {
            currentInPlayingCard = currentSelectedCards[i];
        }
        updateCenterPiles(isPerfectPlay);
        //forces enemy to draw a card if certain conditions are hit
        //single card played matches value and suit of a card played on the center piles
        if (isPerfectPlay) {
            if (currentGameState[currentPlayer] === State.STANDARD) {
                drawCard(sDeck, opponentStandardHand, "opponent-light");
            } else {
                drawCard(iDeck, opponentInvertedHand, "opponent-dark");
            }
        }
        await delay(isPerfectPlay ? DELAY_BETWEEN_CARDS_MOVING * DELAY_PERFECT_PLAY_MULTIPLIER : DELAY_BETWEEN_CARDS_MOVING);
    }
}


