
// ---------------------------- BOT PLAY -----------------------------------------------

async function botPlay() {
    if (currentPlayer == State.FIRST_PLAYER) return;

    //<div class="no-click-screen clickable" id="no-click"></div>
    //document.getElementById("no-click-container").innerHTML = `<div class="no-click-screen">${playerNames[currentPlayer]}'s Turn</div>`;
    currentSelectedCards = [];

    //gets the hand and sorts it 
    await sortHandButton('player-main', currentGameState[currentPlayer] === State.STANDARD ? playerStandardHand : playerInvertedHand);
    await delay(300 / settings.gameSpeed);

    //gets the playable cards from the bot
    await autoSelectCards();

    playButtonActivate();
}

//automatically selects the cards needed for the bot to play
async function autoSelectCards(isHelpButton = false) {

    const hand = currentGameState[currentPlayer] == State.STANDARD ? playerStandardHand : playerInvertedHand;
    let playedCards = isPlayableTurn();

    if (playedCards.length > 0) {
        for (let playedCard of playedCards) {
            const index = hand.indexOf(playedCard);
            //const cardHTML = document.getElementById((101+index));
            const cardHTML = document.querySelector(`[data-index='${index}']`);

            //fixes visuals
            cardHTML.classList.toggle("playing-card-selected");
            cardHTML.classList.toggle("playing-card");

            currentSelectedCards.push(playedCard);
            await delay(300 / settings.gameSpeed);
        }
    } else if (!isHelpButton) {
        await delay(1000 / settings.gameSpeed);
        drawButton();
        return;
    }
}