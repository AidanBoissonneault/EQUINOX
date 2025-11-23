function displayHand(selectedHand, hand) {

    let input = "";
    switch (selectedHand) {
        case "player-main":
            for (let i = 0; i < hand.length; i++) {
                if (currentGameState[currentPlayer] == "standard") {
                    input += `
                        <button class="card playing-card ${hand[i].rank} ${hand[i].suit}" 
                            id="card${i+100}" data-index="${i}" onclick="selectCard(this.dataset.index, FIRST_PLAYER_SENDING_INFO)" style = "z-index: ${i};">
                        </button>`;
                } else {
                    input += `
                        <button class="inverted-card playing-card ${hand[i].rank} ${hand[i].suit}" 
                            id="card${i+100}" data-index="${i}" onclick="selectCard(this.dataset.index, FIRST_PLAYER_SENDING_INFO)" style = "z-index: ${i};">
                        </button>`;
                }
            }
            document.getElementById("player-cards-main").innerHTML = input;
            break;
        case "player-inactive":
            for (let i = 0; i < hand.length; i++) {
                if (currentGameState[currentPlayer] == "standard") {
                    input += `
                        <div class="inverted-card player-card-inactive ${hand[i].rank} ${hand[i].suit}" 
                            id="card${i+200}">
                        </div>`;
                } else {
                    input += `
                    <div class="card player-card-inactive ${hand[i].rank} ${hand[i].suit}" 
                        id="card${i+200}">
                    </div>`;
                }
            }
            document.getElementById("player-cards-inactive").innerHTML = input;
            break;
        case "opponent-light":
            for (let i = 0; i < hand.length; i++) {
                input += `
                    <div class="card opposing-player-card ${hand[i].rank} ${hand[i].suit}" 
                        id="card${i+300}">
                    </div>`;
            }
            document.getElementById("opposing-player-cards-light").innerHTML = input;
            break;
        case "opponent-dark":
            for (let i = 0; i < hand.length; i++) {
                input += `
                    <div class="inverted-card opposing-player-card ${hand[i].rank} ${hand[i].suit}" 
                        id="card${i+400}">
                    </div>`;
            }
            document.getElementById("opposing-player-cards-dark").innerHTML = input;
            break;
    }
}

// ------------------------------- UPDATE CENTER PILES -----------------------------

function updateCenterPiles() {
    document.getElementById("dark-discard").innerHTML = `
        <div class="inverted-card ${currentInPlayingCard.rank} ${currentInPlayingCard.suit}" 
        id="inverted-pile"></div>`;
    document.getElementById("light-discard").innerHTML = `
        <div class="card ${currentStPlayingCard.rank} ${currentStPlayingCard.suit}"
        id="standard-pile"></div>`;
}

// -------------------------------- UPDATE DRAW PILE DATA ------------------------

function updateDrawPileHover() {
    document.getElementById("dark-draw").style.setProperty('--afterText', `"${iDeck.length}/52"`);
    document.getElementById("light-draw").style.setProperty('--afterText', `"${sDeck.length}/52"`);

    if (iDeck.length == 0) {
        document.getElementById("dark-draw").innerHTML = "";
    }
    if (sDeck.length == 0) {
        document.getElementById("light-draw").innerHTML = "";
    }
}

// ------------------------------ VISUAL CUES ------------------------------------------

function setVisualSelectedCard(cardElement) {
    if (cardElement == "noCard") {
        document.getElementById("visual-hint-card").innerHTML = "";
        return;
    }
    document.getElementById("visual-hint-card").innerHTML = currentGameState[currentPlayer] == "standard" ?
        `<div class="card ${cardElement.rank} ${cardElement.suit}"
        id="standard-pile"></div>`
        :
        `<div class="inverted-card ${cardElement.rank} ${cardElement.suit}"
        id="standard-pile"></div>`
        ;
}

// --------------------------- INFO CARD UPDATES -------------------------------------------
var playerNames = ["Player 1",  "Player 2"];
function updateInfoCards() {
    //opposing player side
    document.getElementById("opposing-player-name").innerHTML = playerNames[currentPlayer === State.FIRST_PLAYER ? State.SECOND_PLAYER : State.FIRST_PLAYER];
    document.getElementById("opposing-player-side").innerHTML = currentGameState[currentPlayer === State.FIRST_PLAYER ? State.SECOND_PLAYER : State.FIRST_PLAYER].toUpperCase();
    document.getElementById("opposing-player-light-card-quantity").innerHTML = opponentStandardHand.length;
    document.getElementById("opposing-player-dark-card-quantity").innerHTML = opponentInvertedHand.length;

    //regular player side
    document.getElementById("player-name").innerHTML = playerNames[currentPlayer === State.FIRST_PLAYER ? State.FIRST_PLAYER :  State.SECOND_PLAYER];
    document.getElementById("player-side").innerHTML = currentGameState[currentPlayer === State.FIRST_PLAYER ? State.FIRST_PLAYER : State.SECOND_PLAYER].toUpperCase();
    document.getElementById("player-light-card-quantity").innerHTML = playerStandardHand.length;
    document.getElementById("player-dark-card-quantity").innerHTML = playerInvertedHand.length;
}