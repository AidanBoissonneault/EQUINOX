const CARDS_PER_HAND_ROW = 12; //determined already for us by the flexbox.

function displayHand(selectedHand, hand) {

    let input = "";
    switch (selectedHand) {
        case "player-main":
            for (let i = 0; i < hand.length; i++) {
                if (currentGameState[currentPlayer] == "standard") {
                    input += `
                        <button class="card playing-card ${hand[i].rank} ${hand[i].suit}" 
                            id="card${i+100}" data-index="${i}" onclick="selectCard(this.dataset.index, FIRST_PLAYER_SENDING_INFO)" style = "z-index: ${i+1};">
                        </button>`;
                } else {
                    input += `
                        <button class="inverted-card playing-card ${hand[i].rank} ${hand[i].suit}" 
                            id="card${i+100}" data-index="${i}" onclick="selectCard(this.dataset.index, FIRST_PLAYER_SENDING_INFO)" style = "z-index: ${i};">
                        </button>`;
                }
            }
            document.getElementById("player-cards-main").innerHTML = input;
            if (!settings.optimizedMainHand) {
                let cardsLeftInRow = hand.length-1;
                for (let i = 0; i < hand.length; i++) {
                    if(i % CARDS_PER_HAND_ROW === 0 && i !== 0) cardsLeftInRow -= CARDS_PER_HAND_ROW;
                    
                    let cardsInRow = cardsLeftInRow > CARDS_PER_HAND_ROW ? CARDS_PER_HAND_ROW : cardsLeftInRow;
                    let middleCard = (cardsInRow) / 2;
                    let cardPosition = i % CARDS_PER_HAND_ROW;

                    let rotation = cardPosition - middleCard;
                    let offset = Math.abs(rotation)-2;
                    const ROTATION_MULTIPLIER = 2;
                    document.getElementById(`card${i+100}`).style.setProperty("--rotateAmount", rotation * ROTATION_MULTIPLIER);
                    document.getElementById(`card${i+100}`).style.setProperty("--offsetAmount", offset);
                }
                } else {
                    for (let i = 0; i < hand.length; i++) {
                        document.getElementById(`card${i+100}`).style.setProperty("--rotateAmount", 0);
                        document.getElementById(`card${i+100}`).style.setProperty("--offsetAmount", 0);
                    }
                }
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

let previousPlayedLightCard = new Card();
let previousPlayedDarkCard = new Card();
let cardIdIteratorLight = 0;
let cardIdIteratorDark = DECK_SIZE;
function updateCenterPiles(isPerfectPlay, firstTimeUsed = false) {
    if (settings.optimizedDiscardPile) {
        document.getElementById("dark-discard").innerHTML = `
        <div class="inverted-card ${currentInPlayingCard.rank} ${currentInPlayingCard.suit} add-shadow" 
        id="inverted-pile"></div>`;
        document.getElementById("light-discard").innerHTML = `
        <div class="card ${currentStPlayingCard.rank} ${currentStPlayingCard.suit} add-shadow"
        id="standard-pile"></div>`;
        return;
    }

    const reanimateCards = () => {
        document.getElementById(pileId).insertAdjacentHTML(
            "beforeend", `
            <div class="${cardType} ${replacementCard.rank} ${replacementCard.suit} add-shadow moving-card"
            id="card-${cardIdIterator}"></div>
            `
        );
        const ROTATE_AXIS = 8;
        const REMOVE_BOXSHADOW_AFTER = 5;
        let rotateAmount = Math.random() * (ROTATE_AXIS*2) - ROTATE_AXIS; 
        if (firstTimeUsed) rotateAmount = 0;
        document.getElementById(`card-${cardIdIterator}`).style.setProperty("--rotateAmount", rotateAmount);
        if (isPerfectPlay) document.getElementById(`card-${cardIdIterator}`).classList.add("perfect-play");
        if (![0, DECK_SIZE].includes(cardIdIterator)) document.getElementById(`card-${cardIdIterator-1}`).classList.add("grayed-card");
        if (cardIdIterator % DECK_SIZE - REMOVE_BOXSHADOW_AFTER >= 0) document.getElementById(`card-${cardIdIterator-REMOVE_BOXSHADOW_AFTER}`).classList.remove("add-shadow");
        cardIdIterator++;
    };
    if (currentStPlayingCard.suit !== previousPlayedLightCard.suit || currentStPlayingCard.value !== previousPlayedLightCard.value) {
        var pileId = "light-discard";
        var cardType = "card";
        var replacementCard = { rank: currentStPlayingCard.rank, suit: currentStPlayingCard.suit };
        var cardIdIterator = cardIdIteratorLight;
        reanimateCards();
        cardIdIteratorLight = cardIdIterator;
        previousPlayedLightCard = currentStPlayingCard;
    }
    if (currentInPlayingCard !== previousPlayedDarkCard) {
        var pileId = "dark-discard";
        var cardType = "inverted-card";
        var replacementCard = { rank: currentInPlayingCard.rank, suit: currentInPlayingCard.suit };
        var cardIdIterator = cardIdIteratorDark;
        reanimateCards();
        cardIdIteratorDark = cardIdIterator;
        previousPlayedDarkCard = currentInPlayingCard;
    }
}

// ------------------------------- GENERATE THE DRAW PILES -----------------------

function generateDrawPiles() {
    const DISTANCE_BETWEEN_DECK_CARDS = 0.1;
    for (let i = 0; i < DECK_SIZE; i++) {
    const addCardToPile = () => {
        document.getElementById(idInDocument).insertAdjacentHTML(
            "beforeend", `
            <div class="${cardType} ${addShadow} draw-pile"
            id="draw-${cardType}-${i}"></div>
            `
        )
        document.getElementById(`draw-${cardType}-${i}`).style.setProperty("--offsetX", i * distanceBetweenCardsX);
        document.getElementById(`draw-${cardType}-${i}`).style.setProperty("--offsetY", i * -DISTANCE_BETWEEN_DECK_CARDS);
    }

    let addShadow = "add-shadow";
    if (i % 3 !== 0) addShadow = "";
    let idInDocument = "dark-draw";
    let cardType = "inverted-card";
    let distanceBetweenCardsX = -1 * DISTANCE_BETWEEN_DECK_CARDS;
    addCardToPile();
    idInDocument = "light-draw";
    cardType = "card";
    distanceBetweenCardsX = 1 * DISTANCE_BETWEEN_DECK_CARDS;
    addCardToPile();
    }
}

// -------------------------------- UPDATE DRAW PILE DATA ------------------------

let currentInDeckSize = DECK_SIZE;
let currentStDeckSize = DECK_SIZE;
function updateDrawPileHover(target) {
    document.getElementById("dark-draw").style.setProperty('--afterText', `"${iDeck.length}/${DECK_SIZE}"`);
    document.getElementById("light-draw").style.setProperty('--afterText', `"${sDeck.length}/${DECK_SIZE}"`);

    const removeCardFromDeck = () => {
        if (target === "player-main") {
            document.getElementById(`draw-${cardType}-${removedCard}`).classList.add("move-towards-player");
        } else {
            document.getElementById(`draw-${cardType}-${removedCard}`).classList.add("move-towards-opponent");
        }
    }

    let cardType = "";
    let removeedCard = 0;
    while (currentInDeckSize >= iDeck.length) {
        cardType = "inverted-card";
        removedCard = currentInDeckSize-1;
        currentInDeckSize--;
        removeCardFromDeck();
    }
    while (currentStDeckSize >= sDeck.length) {
        cardType = "card";
        removedCard = currentStDeckSize-1;
        currentStDeckSize--;
        removeCardFromDeck();
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