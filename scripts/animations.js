 // ------------------------------ ANIMATIONS ------------------------------------------

async function buttonFlashRed(buttonId) {
    document.getElementById(buttonId).classList.add("flash");
    await delay(400);
    document.getElementById(buttonId).classList.remove("flash");
}

// Played cards moving

const DELAY_BETWEEN_CARDS_MOVING = 125;
const DELAY_PERFECT_PLAY_MULTIPLIER = 3.5;
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

            audioPlayCard.pause();
            audioPlayCard.currentTime = 0;
            audioPlayCard.play();
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


