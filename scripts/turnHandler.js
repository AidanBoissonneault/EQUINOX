// ------------------------------- END TURN -------------------------------------------

var turnToggle = false;
async function endTurn() {

    //physically flips decks
    let temp = playerStandardHand;
    playerStandardHand = opponentStandardHand;
    opponentStandardHand = temp;
    temp = playerInvertedHand;
    playerInvertedHand = opponentInvertedHand;
    opponentInvertedHand = temp;

    //toggles the current player variable
    currentPlayer = currentPlayer == State.FIRST_PLAYER ? State.SECOND_PLAYER : State.FIRST_PLAYER;

    //animate info boxes
    document.getElementById("player-zone-full").classList.toggle("animated-player-zone");
    document.getElementById("opposing-player-zone-full").classList.toggle("animated-opposing-player-zone");

    if (isAgainstBot && currentPlayer === State.SECOND_PLAYER || isMultiplayer && !turnToggle) {
        document.getElementById("no-click-container").innerHTML = `<div class="no-click-screen">${playerNames[currentPlayer]}'s Turn</div>`;
    }
    document.getElementById("player-cards-main").style.setProperty("--playableCardText", "");

    //flips the current background colors of the card areas if required
    if (currentGameState[State.FIRST_PLAYER] != currentGameState[State.SECOND_PLAYER]) {
        document.getElementById("player-cards-main").classList.toggle("player-cards-light");
        document.getElementById("player-cards-main").classList.toggle("player-cards-dark");
        document.getElementById("player-cards-inactive").classList.toggle("player-cards-light");
        document.getElementById("player-cards-inactive").classList.toggle("player-cards-dark");
        document.getElementById("background-color-display").classList.toggle("background-white");
        document.getElementById("background-color-display").classList.toggle("background-black");
        document.getElementById("light-discard").classList.toggle("light-discard");
        document.getElementById("light-discard").classList.toggle("light-center");
        document.getElementById("dark-discard").classList.toggle("dark-discard");
        document.getElementById("dark-discard").classList.toggle("dark-center");
        document.getElementById("main-game").classList.remove("text-white", "text-black");
        document.getElementById("main-game").classList.add(currentGameState[currentPlayer] == "standard" ? "text-black" : "text-white");
    }

    isFirst = true;
    //currentSelectedCards = [];

    //resets sort buttons
    fixSortButtonLogic();

    //resets visual next card played indicator
    setVisualSelectedCard("noCard");

    //fixes background color with play
    document.getElementById("current-play-background").classList.remove("background-red", "background-blue");
    document.getElementById("current-play-background").classList.add(currentPlayer == State.FIRST_PLAYER ? "background-blue" : "background-red");

    //delay swapping graphics until off screen 
    await delay(400);

    //update card graphics
    if (currentGameState[currentPlayer] == "standard") {
        displayHand("player-main", playerStandardHand);
        displayHand("player-inactive", playerInvertedHand);
    } else {
        displayHand("player-main", playerInvertedHand);
        displayHand("player-inactive", playerStandardHand);
    }
    displayHand("opponent-light", opponentStandardHand);
    displayHand("opponent-dark", opponentInvertedHand);

    //updates info cards
    document.getElementById("opposing-player-info").classList.toggle("opposing-player-info");
    document.getElementById("opposing-player-info").classList.toggle("player-info");
    document.getElementById("player-info").classList.toggle("opposing-player-info");
    document.getElementById("player-info").classList.toggle("player-info");

    updateInfoCards();

    //disable animation
    await delay(400);
    document.getElementById("player-zone-full").classList.toggle("animated-player-zone");
    document.getElementById("opposing-player-zone-full").classList.toggle("animated-opposing-player-zone");

    if (isAgainstBot && currentPlayer === State.SECOND_PLAYER) {
        botPlay();
    } else {
        //auto ends the turn if no valid play is found
        autoEndTurn();
    }

    //if youre in multiplayer and its not your turn, block out screen activity
    if (isMultiplayer && turnToggle || isAgainstBot && currentPlayer === State.FIRST_PLAYER) {
        document.getElementById("no-click-container").innerHTML = "";

        turnToggle = false;
    } else if (isMultiplayer) {
        document.getElementById("no-click-container").innerHTML = `<div class="no-click-screen">${playerNames[currentPlayer]}'s Turn</div>`;
        turnToggle = true;
    }

    currentSelectedCards = [];
}

    // ---------------------------- AUTO END TURN ------------------------------------------

async function autoEndTurn() {
    if (!settings.autoEndTurn) return;
    if (!isFlippingDecks) visualNoPlayableTurn();

    await delay (1000);
    visualNoPlayableTurn();
    if (isPlayableTurn().length === 0) {
        //endPlayerTurnAfterPlay = false;

        if (!settings.autoDraw && (!isAgainstBot || isAgainstBot && currentPlayer === State.FIRST_PLAYER)) return;

        if (currentGameState[currentPlayer] === State.STANDARD && sDeck.length !== 0 ||
            currentGameState[currentPlayer] === State.INVERTED && iDeck.length !== 0    
        ) {
            drawButton();
        } else {
            determineTieWinner();
        }
    }
}

// --------------------------- PLAYABLE TURN CHECK --------------------------------------

//returns a filled array if the player can play a valid hand, if not, returns an empty array.
function isPlayableTurn() {
    if (currentGameState[currentPlayer] === State.STANDARD) {
        //standard deck
        for (let i = 0; i < playerStandardHand.length; i++) {
            if (playerStandardHand[i].value === currentStPlayingCard.value ||
                playerStandardHand[i].value === currentInPlayingCard.value ||
                playerStandardHand[i].suit === currentStPlayingCard.suit ||
                playerStandardHand[i].suit === currentInPlayingCard.suit) {
                const outputHand = [playerStandardHand[i]];
                for (let j = 0; j < playerStandardHand.length; j++) {
                    if (playerStandardHand[i].value === playerStandardHand[j].value && i !== j) { outputHand.push(playerStandardHand[j]); }
                }
                for (const card of outputHand) {
                    console.log(`Playable card: ${card.rank} ${card.suit}`);
                }
                
                return outputHand;
            }
        }


        console.log("unplayable hand, drawing card.");
        return [];
    } else {
        //inverted deck
        for (let invertedCard of playerInvertedHand) {
            let getPlay = checkInvertedCardPlayable([], invertedCard, false);
            if (getPlay.length > 0) {
                return getPlay;
            }
        }
        console.log("unplayable hand, drawing card.")
        return [];
    }
}

// --------------------------------------- GAME TIE WIN CONDITION -------------------------

async function determineTieWinner() {
    let winningPlayer = null;
    let playerSum = playerStandardHand.length + playerInvertedHand.length;
    let opposingSum = opponentStandardHand.length + opponentInvertedHand.length;
    const NO_WINNER = -1;
    if (playerSum == opposingSum) {
        winningPlayer = NO_WINNER;
    } else if (playerSum > opposingSum) {
        winningPlayer = currentPlayer;
    } else {
        winningPlayer = currentPlayer === State.FIRST_PLAYER ? State.SECOND_PLAYER : State.FIRST_PLAYER;
    }

    console.log("\n\n\n\nPlayer" + (winningPlayer+1) + "WINS!");
    await loadPageFragment("winScreen.html");
    if (winningPlayer === NO_WINNER) {
        document.getElementById("win-text").innerHTML = 'TIE GAME!';
    } else {
        document.getElementById("win-text").innerHTML = `${playerNames[winningPlayer]} WINS!`;
    }
}

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