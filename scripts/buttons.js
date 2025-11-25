// -------------------------------- SORT BUTTONs ----------------------------------

function sortHandLogic(hand) {
    hand.sort((a, b) => {
        if (a.value !== b.value) return a.value - b.value;
        return a.suit.localeCompare(b.suit);
    });
}

function sortHandButton(selectedHand, hand, isSecondaryMultiplayer = false) {
    sortHandLogic(hand);
    displayHand(selectedHand, hand);
    //currentSelectedCards = [];
    if (isMultiplayer && !isSecondaryMultiplayer) {
        if (conn && conn.open) {conn.send({ type: 'fixParity', standardDeck: sDeck, invertedDeck: iDeck, pSHand: playerStandardHand.map(c => `${c.rank}-${c.suit}`), pIHand: playerInvertedHand.map(c => `${c.rank}-${c.suit}`), 
            oSHand: opponentStandardHand, oIHand: opponentInvertedHand, cSPcard: currentStPlayingCard, cIPcard: currentInPlayingCard, cP: currentPlayer, 
            cGS: currentGameState, tT: turnToggle, cSC: currentSelectedCards.map(c => `${c.rank}-${c.suit}`)}); 
            conn.send({ type: 'sort', pSHand: playerStandardHand, pIHand: playerInvertedHand});//conn.send({ type: 'sort', stHand: selectedHand, aH: hand});
        } else {
            alert("error sending request");
            return;
        }
    }
}

// -------------------------------- PLAY BUTTON -------------------------------------

async function playButtonActivate(isSecondaryMultiplayer = false) {

    if (isMultiplayer && !isSecondaryMultiplayer) {
        if (conn && conn.open) {
            conn.send({ type: 'fixParity', standardDeck: sDeck, invertedDeck: iDeck, pSHand: playerStandardHand.map(c => `${c.rank}-${c.suit}`), pIHand: playerInvertedHand.map(c => `${c.rank}-${c.suit}`), oSHand: opponentStandardHand, oIHand: opponentInvertedHand, cSPcard: currentStPlayingCard, cIPcard: currentInPlayingCard, cP: currentPlayer, cGS: currentGameState, tT: turnToggle,  cSC: currentSelectedCards.map(c => `${c.rank}-${c.suit}`)});
            await delay(300);
            conn.send({ type: 'play' });
        } else {
            alert("error sending request");
            return;
        }
    }

    //TESTING VARIABLES:
    console.log("\nNew Turn");
    console.log("Current player: " + (currentPlayer+1));
    for (i = 0; i < currentSelectedCards.length; i++)
        console.log("Selected Cards: " + currentSelectedCards.length + " Actual cards: " + currentSelectedCards[i].rank + currentSelectedCards[i].suit);
    console.log("Current standard pile: " + currentStPlayingCard.rank + " " + currentStPlayingCard.suit);
    console.log("Current inveerted pile: " + currentInPlayingCard.rank + " " + currentInPlayingCard.suit);
    console.log("Current player side: " + currentGameState[currentPlayer]);
    for (let i = 0; i < playerStandardHand.length; i++) 
        if (playerStandardHand[i].value !== undefined) console.log("Current player standard cards: " + playerStandardHand.length + " Actual cards: " + playerStandardHand[i].value + playerStandardHand[i].suit);
    for (let i = 0; i < playerInvertedHand.length; i++)
        if (playerInvertedHand[i].value !== undefined) console.log("Current player inverted cards: " + playerInvertedHand.length + " Actual cards: " + playerInvertedHand[i].value + playerInvertedHand[i].suit); 

    //stores if the game should end turn after play is made
    let endPlayerTurnAfterPlay = true;
    //if 0 cards are selected, return
    if (currentSelectedCards.length == 0) {
        buttonFlashRed("player-play-button");
        console.log("failed, current selected cards is none.");
        return;
    };

    //checks game state
    switch (currentGameState[currentPlayer]) {
        case State.STANDARD: 

            //new rule testing 
            //one of the played cards must match the suit of either card in the discard piles, or the value of those cards.
            //if 1 or more cards can be played, as long as they are the same value.
            let playedValues = [];
            let playedSuits = [];
            for (let i = 0; i < currentSelectedCards.length; i++) {
                playedValues.push(currentSelectedCards[i].value);
                if (!playedSuits.includes(currentSelectedCards[i].suit)) {
                    playedSuits.push(currentSelectedCards[i].suit);
                }
            }
            playedValues.sort();
            const suitMatches = playedSuits.includes(currentStPlayingCard.suit) || playedSuits.includes(currentInPlayingCard.suit);
            const valueMatches = playedValues.includes(currentStPlayingCard.value) || playedValues.includes(currentInPlayingCard.value);
            const allValuesSame = playedValues.length === 1 || playedValues.every(value => value === playedValues[0]);

            if ((suitMatches || valueMatches) && allValuesSame) {} else {
                buttonFlashRed("player-play-button");
                console.log("failed match requirements");
                return;
            }

            //determines if a perfect play was made
            var isPerfectPlay = false;
            if (currentSelectedCards.length > 1 ||
                currentSelectedCards[0].value == currentInPlayingCard.value && currentSelectedCards[0].suit == currentInPlayingCard.suit
            ) { isPerfectPlay = true; }

            await animateSelectedCards(isPerfectPlay);

            //forces enemy to draw a card if certain conditions are hit
            //single card played matches value and suit of a card played on the center piles
            /*
            if (isPerfectPlay) {
                for (const cards in currentSelectedCards)
                    drawCard(sDeck, opponentStandardHand, "opponent-light");
            } */ //moved to the animateSelectedCards for consistency

            //change center pile (will need to edit later to choose the lower value of the two)
            currentStPlayingCard = currentSelectedCards[0];
            updateCenterPiles();

            //remove played card(s) from hand
            for (let i = 0; i < currentSelectedCards.length; i++) {
                playerStandardHand.splice(playerStandardHand.indexOf(currentSelectedCards[i]), 1);
            }

            currentSelectedCards = [];

            //resets the display
            displayHand("player-main", playerStandardHand);

            //flips decks if needed
            if ([1, 11, 12, 13].includes(currentStPlayingCard.value) || playerStandardHand.length == 0) {
                if (playerInvertedHand != 0) {
                    flipDecks();
                    setVisualSelectedCard("noCard");
                    isFirst = true;
                    console.log("FLIPPING DECKS!");
                    endPlayerTurnAfterPlay = false;

                    //auto ends turn if needed 
                    autoEndTurn();
                } else {
                    console.log("flip failed, no cards on inverted hand");
                }
            }
            break;
        case State.INVERTED:
            //get the sum of all selected cards
            //if 11-13 is a value, only add 1
            let sum = 0;
            let hasFaceCard = false;
            for (let i = 0; i < currentSelectedCards.length; i++) {
                if (currentSelectedCards[i].value > 10 || currentSelectedCards[i].value === 1) {
                    sum += 1;
                    hasFaceCard = true;
                    continue;
                }

                sum += currentSelectedCards[i].value;
            }
            console.log("Sum: " + sum);
            
            //validate is the sum of cards is equal to the number on the main play pile
            //edge cases:
            //if the number on the main play pile is ace, try again with a sum of 11
            //if the number on the main play pile is a face, check if the number is between 1-10
            //if the played hand contains a face card and it is lower than the goal sum, allow play
            //if the current card to be played on is an ace, and the player plays a combination to hit 11 sum with a face card
            if (sum == currentInPlayingCard.value ||
                currentInPlayingCard.value == 1 && sum == 11 ||
                currentInPlayingCard.value > 10 && sum <= 10 ||
                (currentInPlayingCard.value > 10 ? 10 : currentInPlayingCard.value) > sum && hasFaceCard ||
                currentInPlayingCard.value == 1 && sum > 1 && sum <= 11 && hasFaceCard ||

                //alternate rules start here
                sum == currentStPlayingCard.value ||
                currentStPlayingCard.value == 1 && sum == 11 ||
                currentStPlayingCard.value > 10 && sum <= 10 ||
                (currentStPlayingCard.value > 10 ? 10 : currentStPlayingCard.value) > sum && hasFaceCard ||
                currentStPlayingCard.value == 1 && sum > 1 && sum <= 11 && hasFaceCard
            ) 
            {} else {
                buttonFlashRed("player-play-button");
                console.log("Failed valid play check!");
                return;
            }
            //checks for a perfect play
            var isPerfectPlay = false;
            for (let i = 0; i < currentSelectedCards.length; i++) {
                if (currentInPlayingCard.suit !== currentSelectedCards[i].suit &&
                    currentStPlayingCard.suit !== currentSelectedCards[i].suit
                ) { break; }

                if (i == currentSelectedCards.length-1) {
                    isPerfectPlay = true;
                }
            }

            await animateSelectedCards(isPerfectPlay);

            //forces enemy to draw cards under certain conditions
            //condition: all cards played are the same color as the base card they are played on
            //opposing player picks up quantity equal to the amount of cards currently played

            /*if (isPerfectPlay) {
                for (let i = 0; i < currentSelectedCards.length; i++) {
                    if (i != 0) await delay (DELAY_BETWEEN_DRAWN_CARDS);
                    drawCard(iDeck, opponentInvertedHand, "opponent-dark");
                }
            }*/ //moved to animateSelectedCards for simplicity

            //change center pile (will need to edit later to choose the lowest value)
            currentInPlayingCard = currentSelectedCards[0];
            updateCenterPiles();

            //removes player card(s) from hand
            for (let i = 0; i < currentSelectedCards.length; i++) {
                playerInvertedHand.splice(playerInvertedHand.indexOf(currentSelectedCards[i]), 1);
            }
            currentSelectedCards = [];

            //resets the display
            displayHand("player-main", playerInvertedHand);

            //flips decks if needed
            if (hasFaceCard || currentInPlayingCard.value == 1 || playerInvertedHand.length == 0) {
                if (playerStandardHand.length != 0) {
                    flipDecks();
                    setVisualSelectedCard("noCard");
                    isFirst = true;
                    //currentSelectedCards = [];
                    console.log("FLIPPING DECKS!");
                    endPlayerTurnAfterPlay = false;

                    //auto ends turn if needed 
                    autoEndTurn();
                } else {
                    console.log("failed deck flip, standard hand is out of cards");
                }
            }
            break;
    }

    // ------------- GAME WIN CONDITION ---------------------
    if (playerInvertedHand.length == 0 && playerStandardHand.length == 0) {
        console.log("\n\n\n\nPlayer" + (currentPlayer+1) + "WINS!");
        await loadPageFragment("winScreen.html");
        document.getElementById("win-text").innerHTML = `${playerNames[currentPlayer]} WINS!`;
        return;
    }

    //updates the draw pile hover amount shown
    updateDrawPileHover();

    //ends turn if no face card or ace was played
    if (endPlayerTurnAfterPlay) {
        endTurn();
    }

    //if its the bots turn, play again.
    if (isAgainstBot && currentPlayer === State.SECOND_PLAYER && !endPlayerTurnAfterPlay) {
        await delay (1000);
        console.log("\nbot turn continues");
        botPlay();
    }

    //update player info cards
    updateInfoCards();
}

// ------------------------------- DRAW BUTTON ----------------------------------------

//draws a card from deck to hand, displays hand afterwards
function drawCard(deck, hand, cardLocation) {
    if (deck.length <= 0) {
        buttonFlashRed("player-draw-button");
        return;
    };

    //draws card
    hand.push(deck.pop());

    //updates assorted visuals
    isFirst = true;
    //currentSelectedCards = [];
    displayHand(cardLocation, hand);
    updateDrawPileHover(cardLocation);
}

const DRAW_BUTTON_TIMEOUT = 1000;
let drawButtonTimer = 0;
async function timeBetweenDrawPressed() {
    while (drawButtonTimer < DRAW_BUTTON_TIMEOUT) {
        drawButtonTimer++;
        await delay(1);
    }
    drawButtonTimer = 0;
    return;
}

//what the pushed draw button actually goes to
function drawButton(isSecondaryMultiplayer = false) {
    if (drawButtonTimer > 0) return;
    timeBetweenDrawPressed();

    if (isMultiplayer && !isSecondaryMultiplayer) {
        if (conn && conn.open) conn.send({ type: 'draw' });
        else {
            alert("error sending message");
            return;
        }
    }

    if (currentGameState[currentPlayer] == State.STANDARD) {
        drawCard(sDeck, playerStandardHand, "player-main");
    } else {
        drawCard(iDeck, playerInvertedHand, "player-main");
    }
    if (currentGameState[currentPlayer] === State.STANDARD && sDeck.length > 0 ||
        currentGameState[currentPlayer] === State.INVERTED && iDeck.length > 0
    ) {
        endTurn();
    } else {
        determineTieWinner();
    }
}