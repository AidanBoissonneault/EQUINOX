// --------------------------- MAKES A VALID INVERTED PLAY ----------------------------

//recursively checks if a card is lower than sum
//keeps in mind face cards and ace values

function checkInvertedCardPlayable(cardArr, invertedCard, hasFaceCard) {
    //adds tested card into array
    let theCardArr = [...cardArr, invertedCard];

    //calculates sum
    //if the face card
    let tempSum = 0;
    for (let theCard of theCardArr) {
        if (theCard.value <= 10) {
            tempSum += theCard.value;
        } else {
            tempSum += 1;
            hasFaceCard = true;
        }
    }
    console.log(`The sum: ${tempSum} Has face card: ${hasFaceCard}`);

    //if the sum is greater than value, go down a layer
    if (tempSum > currentInPlayingCard.value && tempSum > currentStPlayingCard.value) {
        return [];
    }

    //if the sum is equal to either value 
    if (tempSum === currentInPlayingCard.value ||
        tempSum === currentStPlayingCard.value ||
        currentInPlayingCard.value > 10 ||
        currentStPlayingCard.value > 10 ||
        currentInPlayingCard.value === 1 && tempSum === 11 ||
        currentStPlayingCard.value === 1 && tempSum === 11 ||
        tempSum < currentInPlayingCard.value && hasFaceCard ||
        tempSum < currentStPlayingCard.value && hasFaceCard
    ) {
        for (let playedCards of theCardArr) {
            console.log(`Playable Hand: ${playedCards.rank} ${playedCards.suit}`);
        }
        return theCardArr;
    }

    //if the card is not already in hand, try it again for another play
    for (let i = 0; i < playerInvertedHand.length; i++) {
        if (!theCardArr.includes(playerInvertedHand[i])) {
            var getPlay = checkInvertedCardPlayable(theCardArr, playerInvertedHand[i], hasFaceCard);
            if (getPlay.length > 0) {
                return getPlay;
            }
        }
    }

    //no valid play found
    return [];
}

// ---------------------------- BOT PLAY -----------------------------------------------

async function botPlay() {

    //<div class="no-click-screen clickable" id="no-click"></div>
    document.getElementById("no-click-container").innerHTML = '<div class="no-click-screen">Opponents Turn</div>';
    currentSelectedCards = [];

    //gets the hand and sorts it 
    sortHandButton('player-main', currentGameState[currentPlayer] === "standard" ? playerStandardHand : playerInvertedHand);
    const hand = currentGameState[currentPlayer] == "standard" ? playerStandardHand : playerInvertedHand;
    await delay(300);

    //gets the playable cards from the bot
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
            await delay(1000);
        }
    } else {
        await delay(1000);
        drawButton();
    }

    playButtonActivate();
    document.getElementById("no-click-container").innerHTML = "";
}