//----------------------------------- HANDS ----------------------------------


//used to deal out hands

async function dealHands(deck, hand, display) {

        hand.push(deck.pop());

        displayHand(display, hand);
}

async function dealBothDecks() {
    for (let i = 0; i < HAND_SIZE; i++) {
        dealHands(sDeck, playerStandardHand, "player-main");
        dealHands(sDeck, opponentStandardHand, "opponent-light");
        dealHands(iDeck, playerInvertedHand, "player-inactive");
        dealHands(iDeck, opponentInvertedHand, "opponent-dark");

        updateDrawPileHover();
        updateInfoCards();

        await delay(DELAY_BETWEEN_DRAWN_CARDS);
    }
}


// -------------------------------- CARD SELECTION -------------------------------

let isFirst = true;
let lastSelectedCard;
function selectCard(index, isSecondaryMultiplayer = false) {
let cardElement = document.querySelector(`[data-index='${index}']`);
const hand = currentGameState[currentPlayer] == "standard" ? playerStandardHand : playerInvertedHand;
const cardObject = hand[index];

//for multiplayer
if (isMultiplayer && !isSecondaryMultiplayer) {
    if (conn && conn.open) {
    conn.send({type: 'selectCard', sentCard: index });
    console.log("selected card sent");
    } else {
        alert("error sending data");
        return;
    }
}

//fixes visuals
cardElement.classList.toggle("playing-card-selected");
cardElement.classList.toggle("playing-card");

//add or remove card from currently selected array
if (cardElement.classList.contains("playing-card-selected")) {
    currentSelectedCards.push(cardObject);
} else {
    //resets the first currently selected card
    if (cardObject == lastSelectedCard) {
        document.querySelector(`[data-index='${hand.indexOf(lastSelectedCard)}']`).classList.remove("first-selected");
        isFirst = true;
    }

    const removeIndex = currentSelectedCards.indexOf(cardObject);
    if (removeIndex !== -1) currentSelectedCards.splice(removeIndex, 1);
}

if (currentSelectedCards.length > 0) {
    setVisualSelectedCard(currentSelectedCards[0]);
    if (isFirst) {
        document.querySelector(`[data-index='${hand.indexOf(currentSelectedCards[0])}']`).classList.add("first-selected");
        isFirst = false;
        lastSelectedCard = currentSelectedCards[0];
    }
} else {
    setVisualSelectedCard("noCard");
    isFirst = true;
    document.querySelector(`[data-index='${hand.indexOf(lastSelectedCard)}']`).classList.remove("first-selected");
}
}