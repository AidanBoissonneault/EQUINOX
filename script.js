 //if the player is vs a bot or 2 player
    var isAgainstBot = false;

    //if the player is playing against a local opponent
    var isMultiplayer = false;

    //cards 

    //deck references
    var sDeck = []; //standard deck
    var iDeck = []; //inverted deck

    //stores hand info
    const _handSize = 7; //drawing hand size
    var playerStandardHand = []; //cards in hands are stored here
    var playerInvertedHand = [];
    var opponentStandardHand = [];
    var opponentInvertedHand = [];

    //stores current card the player will play on
    var currentStPlayingCard;
    var currentInPlayingCard;

    //cards selected by player
    var currentSelectedCards = [];

    //stores current game state (standard or inverted)
    var currentGameState = ["standard", "standard"];
    var currentPlayer = 0;

    //card class
    class Card {
        constructor(type, suit, rank, value) {
            this.type = type;
            this.suit = suit;
            this.rank = rank;
            this.value = value;
        }
    }

    //loads the entire standard deck of cards, any ingame
    function generateDeck(deck, type) {
        const suits = ["hearts", "clubs", "diamonds", "spades"];
        const rankName = ["ace", "two", "three", "four", "five",
                        "six", "seven", "eight", "nine", "ten",
                        "jack", "queen", "king"];
        //const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

        for (let i = 0; i < suits.length; i++) {
            for (let j = 0; j < rankName.length; j++) {
                deck.push(new Card(type, suits[i], rankName[j], j+1));
            }
        }
    }

    //shuffle decks
    function shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]]; // real in-place swap
        }
    }   

    //swaps two cards
    function swapCards(card1, card2) {
        let temp = card1;
        card1 = card2;
        card2 = temp;
    }

    //loads a screen
    async function loadPageFragment(file) {
        const html = await fetch(file).then(res => res.text());
        document.getElementById(actualBody).innerHTML = html;
    }

    //boots up at the start of game, shuffles decks, changes screens, etc
    async function startGame() {
        /*
        document.getElementById("title-screen").className = "screen";
        document.getElementById("title-screen-container").className = "screen";
        document.getElementById("multiplayer-screen").className = "screen";
        document.getElementById("main-game").className = "active"; */
        await loadPageFragment("mainGame.html");


        generateDeck(sDeck, "standard");
        generateDeck(iDeck, "inverted");
        shuffleDeck(sDeck);
        shuffleDeck(iDeck);
        dealHands(sDeck, playerStandardHand, opponentStandardHand, "player-main", "opponent-light");
        dealHands(iDeck, playerInvertedHand, opponentInvertedHand, "player-inactive", "opponent-dark");

        currentStPlayingCard = sDeck.pop();
        currentInPlayingCard = iDeck.pop();
        updateCenterPiles();
        updateDrawPileHover();

        if (isMultiplayer) {
            document.getElementById("dark-draw").innerHTML = '<div class="inverted-card clubs" id="filler"></div>';
            document.getElementById("light-draw").innerHTML = '<div class="card clubs" id="filler"></div>';
            document.getElementById("no-click-container").innerHTML = '<div class="no-click-screen">Loading...</div>';
            if (conn && conn.open) { conn.send({ type: 'send-name', pId: myId, fPlayer: true }); }
            await delay(2500);
            if (conn && conn.open) {
                conn.send({ type: 'start', standardDeck: sDeck, invertedDeck: iDeck, pSHand: playerStandardHand, pIHand: playerInvertedHand, oSHand: opponentStandardHand, oIHand: opponentInvertedHand, cSPcard: currentStPlayingCard, cIPcard: currentInPlayingCard});
            } else {
                alert("error sending data");
                return;
            }
        } 

        //auto ends turn if needed 
        autoEndTurn();
    }

    async function startBotGame() {
        isAgainstBot = true;
        playerNames[1] = "BOT";
        await startGame();
        updateInfoCards();
    }

    //----------------------------------- HANDS ----------------------------------

    //generates hands

    //used to deal out hands
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async function dealHands(deck, hand1, hand2, display1, display2) {

        for (let j = 0; j < _handSize; j++) {
            await delay(200);
            hand1.push(deck.pop());
            hand2.push(deck.pop());

            displayHand(display1, hand1);
            displayHand(display2, hand2);
            updateDrawPileHover();
            updateInfoCards();
        }

        /*
        if (display2 === "opponent-dark") {
            if (isMultiplayer) {
            await delay(2000);
            conn.send({ type: 'start', standardDeck: sDeck, invertedDeck: iDeck, pSHand: playerStandardHand, PIHand: playerInvertedHand, oSHand: opponentStandardHand, oIHand: opponentInvertedHand, cSPcard: currentStPlayingCard, cIPcard: currentInPlayingCard});
        }
        } */
    }

    //show current player hand

    function displayHand(selectedHand, hand) {

        let input = "";
        switch (selectedHand) {
            case "player-main":
                for (let i = 0; i < hand.length; i++) {
                    if (currentGameState[currentPlayer] == "standard") {
                        input += `
                            <div class="card playing-card ${hand[i].rank} ${hand[i].suit}" 
                                id="card${i+100}" data-index="${i}" onclick="selectCard(this.dataset.index, false)">
                            </div>`;
                    } else {
                        input += `
                            <div class="inverted-card playing-card ${hand[i].rank} ${hand[i].suit}" 
                                id="card${i+100}" data-index="${i}" onclick="selectCard(this.dataset.index, false)">
                            </div>`;
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
            case "standard": 

                //if more than 2 cards are selected, return to program, invalid play.
                if (currentSelectedCards.length > 2) {
                    buttonFlashRed("player-play-button");
                    console.log("failed, current selected cards is greater than 2");
                    return;
                }

                //if 2 cards are selected, check if both are the same value and color
                //if they are, check if they are the same color, if not return to program.
                if (currentSelectedCards.length != 1) {
                    if (currentSelectedCards[0].value != currentSelectedCards[1].value
                    || !validateLikeSuits(currentSelectedCards[0].suit, currentSelectedCards[1].suit)) {
                        buttonFlashRed("player-play-button");
                        console.log("failed, both cards do not match");
                        return;
                    }
                }

                //continue as usual once 1 card is selected
                //validate play
                //additional set: checks if the player can play their current card based off of the
                //inverted top card. if yes, no additional cards will be dealt to the enemy, but 
                //play will be allowed.
                if (
                    currentSelectedCards[0].value == currentStPlayingCard.value ||
                    alternateSuits(currentStPlayingCard.suit).includes(currentSelectedCards[0].suit) ||
                    (currentSelectedCards.length > 1 &&
                    alternateSuits(currentStPlayingCard.suit).includes(currentSelectedCards[1].suit))
                
                    //alternate rules where the white side can also be played if all of the rules match black sides card
                    //issue forseen: too loose, can play almost all cards most of the time
                    /*
                    || currentSelectedCards[0].value == currentInPlayingCard.value ||
                    alternateSuits(currentInPlayingCard.suit).includes(currentSelectedCards[0].suit) ||
                    (currentSelectedCards.length > 1 &&
                    alternateSuits(currentInPlayingCard.suit).includes(currentSelectedCards[1].suit))
                    */
                    //alternate rules: allows play if suit or number perfectly matches other side.
                    || currentSelectedCards[0].value == currentInPlayingCard.value ||
                    currentInPlayingCard.suit == currentSelectedCards[0].suit ||
                    currentSelectedCards.length > 1 &&
                    currentInPlayingCard.suit == currentSelectedCards[1].suit
                ) {} else { 
                    buttonFlashRed("player-play-button");
                    console.log("failed matching color or value");
                    return;
                }

                //forces enemy to draw a card if certain conditions are hit
                //condition 1: play 2 of the same card
                //condition 2: play 1 of the same card on the center pile
                if (currentSelectedCards.length == 2 ||
                    currentSelectedCards[0].value == currentStPlayingCard.value && validateLikeSuits(currentSelectedCards[0].suit, currentStPlayingCard.suit)
                ) {
                    drawCard(sDeck, opponentStandardHand, "opponent-light");
                }

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
                        //currentSelectedCards = [];
                        console.log("FLIPPING DECKS!");
                        endPlayerTurnAfterPlay = false;

                        //auto ends turn if needed 
                        autoEndTurn();
                    } else {
                        console.log("flip failed, no cards on inverted hand");
                    }
                }
                break;
            case "inverted":
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

                //forces enemy to draw cards under certain conditions
                //condition: all cards played are the same color as the base card they are played on
                //opposing player picks up quantity equal to the amount of cards currently played

                
                for (let i = 0; i < currentSelectedCards.length; i++) {
                    if (!validateLikeSuits(currentInPlayingCard.suit, currentSelectedCards[i].suit) &&
                        currentInPlayingCard.suit != currentSelectedCards[i].suit
                    ) { break; }

                    if (i == currentSelectedCards.length-1) {
                        for (let j = 0; j < currentSelectedCards.length; j++) {
                            if (j != 0) await delay (200);
                            drawCard(iDeck, opponentInvertedHand, "opponent-dark");
                        }
                    }
                }

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
            document.getElementById("main-game").classList.remove("active");
            document.getElementById("main-game").classList.add("screen");
            document.getElementById("win-screen").classList.remove("screen");
            document.getElementById("win-screen").classList.add("active");
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
        if (isAgainstBot && currentPlayer === 1 && !endPlayerTurnAfterPlay) {
            await delay (1000);
            console.log("\nbot turn continues");
            botPlay();
        }

        //update player info cards
        updateInfoCards();
    }

    // --------------------------------------- GAME TIE WIN CONDITION -------------------------

    function determineTieWinner() {
        let winningPlayer = null;
        let playerSum = playerStandardHand.length + playerInvertedHand.length;
        let opposingSum = opponentStandardHand.length + opponentInvertedHand.length;
        if (playerSum == opposingSum) {
            winningPlayer = -1;
        } else if (playerSum > opposingSum) {
            winningPlayer = currentPlayer;
        } else {
            winningPlayer = currentPlayer === 0 ? 1 : 0;
        }

        console.log("\n\n\n\nPlayer" + (winningPlayer+1) + "WINS!");
        document.getElementById("main-game").classList.remove("active");
        document.getElementById("main-game").classList.add("screen");
        document.getElementById("win-screen").classList.remove("screen");
        document.getElementById("win-screen").classList.add("active");
        if (winningPlayer === -1) {
            document.getElementById("win-text").innerHTML = 'TIE GAME!';
        } else {
            document.getElementById("win-text").innerHTML = `${playerNames[winningPlayer]} WINS!`;
        }
    }

    //checks if both cards are the same color when 2 cards suits are put in
    //used for when 2 light cards are played at the same time
    function validateLikeSuits(suit1, suit2) {
        let arr = [suit1, suit2];
        arr.sort();

        if (arr[0] == "diamonds" && arr[1] == "hearts"
            || arr[0] == "clubs" && arr[1] == "spades") return true;
        return false;
    }

    //outputs all suits for each color when the user is playing on white side
    function alternateSuits(suit) {
        /*
        switch (suit) {
            case "hearts":
            case "diamonds": return ["hearts", "diamonds"];
            case "clubs":
            case "spades": return ["spades", "clubs"];
        }
            */

        //swapping function to only allow exact suit for testing
        return suit;
    }

    // ------------------------------- DRAW BUTTON ----------------------------------------
    
    //draws a card from deck to hand, displays hand afterwards
    function drawCard(deck, hand, selectedDeck) {
        if (deck.length <= 0) {
            buttonFlashRed("player-draw-button");
            return;
        };

        //draws card
        hand.push(deck.pop());

        //updates assorted visuals
        isFirst = true;
        //currentSelectedCards = [];
        displayHand(selectedDeck, hand);
        updateDrawPileHover();
    }

    //what the pushed draw button actually goes to
    function drawButton(isSecondaryMultiplayer = false) {
        if (isMultiplayer && !isSecondaryMultiplayer) {
            if (conn && conn.open) conn.send({ type: 'draw' });
            else {
                alert("error sending message");
                return;
            }
        }

        if (currentGameState[currentPlayer] == "standard") {
            drawCard(sDeck, playerStandardHand, "player-main");
        } else {
            drawCard(iDeck, playerInvertedHand, "player-main");
        }
        if (currentGameState[currentPlayer] === "standard" && sDeck.length > 0 ||
            currentGameState[currentPlayer] === "inverted" && iDeck.length > 0
        ) {
            endTurn();
        }
    }

    // --------------------------------- FLIP SIDES ---------------------------------------

    async function flipDecks() {
        //checks if the current deck it is flipping to is empty
        //if it is empty, do not flip.
        if (currentGameState[currentPlayer] == "standard" && playerInvertedHand.length == 0 ||
                currentGameState[currentPlayer] == "inverted" && playerStandardHand.length == 0) {
            return;
        }

        //delay for animation, adds animation
        document.getElementById("player-zone-full").classList.toggle("animated-player-zone");
        await delay(400);

        //change current gamestate for the player
        currentGameState[currentPlayer] = currentGameState[currentPlayer] == "standard" ? "inverted" : "standard";
        //reload hands
        if (currentGameState[currentPlayer] != "standard") {
            displayHand("player-inactive", playerStandardHand);
            displayHand("player-main", playerInvertedHand);
        } else {
            displayHand("player-main", playerStandardHand);
            displayHand("player-inactive", playerInvertedHand);
        }

        //change backgrounds
        document.getElementById("player-cards-main").classList.toggle("plyayer-cards-light");
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


        //fixes sort button logic
        fixSortButtonLogic();

        //fixes the current flashing card in edge cases
        setVisualSelectedCard("noCard");

        //updates the player info cards
        updateInfoCards();

        //animation removal
        await delay(400);
        document.getElementById("player-zone-full").classList.toggle("animated-player-zone");
    }

    //fixes sort button logic when flips are made
    function fixSortButtonLogic() {
        if (currentGameState[currentPlayer] != "standard") {
            document.getElementById("player-sort-buttons").innerHTML = `<span id="sort-text">Sort</span>
                <form class="player-sort-buttons-background">
                    <input type="button" value="Standard" class="sort-button light-sort-button" id="light-sort-button" onclick="sortHandButton('player-inactive', playerStandardHand)">
                    <input type="button" value="Inverted" class="sort-button dark-sort-button" id="dark-sort-button" onclick="sortHandButton('player-main', playerInvertedHand)">
                </form>`;
        } else {
            document.getElementById("player-sort-buttons").innerHTML = `<span id="sort-text">Sort</span>
                <form class="player-sort-buttons-background">
                    <input type="button" value="Standard" class="sort-button light-sort-button" id="light-sort-button" onclick="sortHandButton('player-main', playerStandardHand)">
                    <input type="button" value="Inverted" class="sort-button dark-sort-button" id="dark-sort-button" onclick="sortHandButton('player-inactive', playerInvertedHand)">
                </form>`;
        }
    }

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
        currentPlayer = currentPlayer == 0 ? 1 : 0;

        //animate info boxs
        document.getElementById("player-zone-full").classList.toggle("animated-player-zone");
        document.getElementById("opposing-player-zone-full").classList.toggle("animated-opposing-player-zone");

        //flips the current background colors of the card areas if required
        if (currentGameState[0] != currentGameState[1]) {
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
        document.getElementById("current-play-background").classList.add(currentPlayer == 0 ? "background-blue" : "background-red");

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

        //update info card
        //if the player is fighting against a bot, use the name bot for opposing player, otherwise use player 2
        //document.getElementById("player-name").innerHTML = currentPlayer == 0 ? "Player 1" : isAgainstBot ? "Bot" : "Player 2";
        //document.getElementById("opposing-player-name").innerHTML = currentPlayer == 1 ? "Player 1" : isAgainstBot ? "Bot" : "Player 2";
        updateInfoCards();

        //disable animation
        await delay(400);
        document.getElementById("player-zone-full").classList.toggle("animated-player-zone");
        document.getElementById("opposing-player-zone-full").classList.toggle("animated-opposing-player-zone");

        if (isAgainstBot && currentPlayer === 1) {
            botPlay();
        } else {
            //auto ends the turn if no valid play is found
            autoEndTurn();
        }

        //if youre in multiplayer and its not your turn, block out screen activity
        if (isMultiplayer && turnToggle) {
            document.getElementById("no-click-container").innerHTML = "";

            turnToggle = false;
        } else if (isMultiplayer) {
            document.getElementById("no-click-container").innerHTML = `<div class="no-click-screen">${playerNames[currentPlayer]}'s turn</div>`;
            turnToggle = true;
        }
    }

    // ------------------------------ ANIMATIONS ------------------------------------------

    async function buttonFlashRed(buttonId) {
        document.getElementById(buttonId).classList.add("flash");
        await delay(400);
        document.getElementById(buttonId).classList.remove("flash");
    }

    // ---------------------------- AUTO END TURN ------------------------------------------

    async function autoEndTurn() {
        await delay (1000);
        if (isPlayableTurn().length === 0) {
            endPlayerTurnAfterPlay = false;
            if (currentGameState[currentPlayer] === "standard" && sDeck.length !== 0 ||
                currentGameState[currentPlayer] === "inverted" && iDeck.length !== 0    
            ) {
                drawButton();
            } else {
                determineTieWinner();
            }
        }
    }

    // --------------------------- PLAYABLE TURN CHECK --------------------------------------

    //returns true if the player can play a valid hand, if not, returns false.
    function isPlayableTurn() {
        if (currentGameState[currentPlayer] === "standard") {
            //standard deck

            for (let standardCard of playerStandardHand) {
                if (standardCard.value === currentStPlayingCard.value ||
                    standardCard.value === currentInPlayingCard.value ||
                    alternateSuits(currentStPlayingCard.suit).includes(standardCard.suit) ||
                    standardCard.suit === currentInPlayingCard.suit) {
                        console.log(`Playable card: ${standardCard.rank} ${standardCard.suit}`);
                        return [standardCard];
                    }
            }
            console.log("unplayable hand, drawing card.");
            return [];
        } else {
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

    }

    /* ---------- PeerJS connection logic ---------- */
/* IMPORTANT: this example uses the public PeerJS default (PeerServer cloud).
   If you want to run a local PeerServer, instantiate Peer(...) with host/port/path
   per the PeerJS docs. */

var myPlayerId;
let conn = null;   // PeerJS DataConnection
let peer = null;   // Peer

function makeSimpleId() {
  const words = ['cat', 'dog', 'fox', 'owl', 'bee', 'bat', 'cow', 'ant'];
  return words[Math.floor(Math.random() * words.length)] + 
         Math.floor(Math.random() * 100);
}

function createButtonLogic() {
    if (peer) return;
    if (myId === "") myId = makeSimpleId();
  peer = new Peer(myId); // default PeerServer (cloud) for signaling
  peer.on('open', id=>{
    document.getElementById('myId').textContent = id;
    document.getElementById('connState').textContent = 'listening';
  });
  peer.on('connection', incoming=>{
    // accept only one connection in this tiny demo
    if (conn) {
      incoming.on('open', ()=>incoming.send({type:'busy'}));
      return;
    }
    setupConnection(incoming, true); // remote initiated -> we are "host" receiver, assign roles below
  });
  peer.on('error', err=>{
    console.error('Peer error', err);
    alert('Peer error: ' + err);
  });
}

let myId = ""; //stores player connection id
let remoteId = ""; //stores opponent connection id
function connectButtonLogic() {
    const remoteId = document.getElementById('remoteId').value.trim();
    if (myId === "") myId = makeSimpleId();
    //playerNames = [myId, remoteId];
    if (!remoteId) return alert('Enter remote peer id');
    if (!peer) {
        peer = new Peer(myId);
        peer.on('open', id => document.getElementById('myId').textContent = id);
        peer.on('error', e => console.error(e));
    }
    if (conn) conn.close();
    const outgoing = peer.connect(remoteId, {reliable:true});
    setupConnection(outgoing, false);
};

function setupConnection(connection, isIncoming){
    conn = connection;
    conn.on('open', ()=>{
    document.getElementById('connState').textContent = 'connected';
  });

conn.on('data', data=>{
    if (!data || !data.type) return;
    if (data.type === 'role'){
    } else if (data.type === 'selectCard') {
        selectCard(data.sentCard, true);
    } else if (data.type === 'sort') {
        playerStandardHand = data.pSHand;
        playerInvertedHand = data.pIHand;
        displayHand('player-main', currentGameState[currentPlayer] === "standard" ? playerStandardHand : playerInvertedHand);
        displayHand('player-inactive', currentGameState[currentPlayer] === "standard" ? playerInvertedHand : playerStandardHand);
    } else if (data.type === 'draw') {
        drawButton(true);
    } else if (data.type === 'play') {
        playButtonActivate(true);
    } else if (data.type === 'start') {
        //conn.send({ type: 'start', standardDeck: sDeck, invertedDeck: iDeck, pSHand: playerStandardHand, pIHand: playerInvertedHand, oSHand: opponentStandardHand, oIHand: opponentInvertedHand, cSPcard: currentStPlayingCard, cIPcard: currentInPlayingCard});

        sDeck = data.standardDeck;
        iDeck = data.invertedDeck;
        playerStandardHand = data.pSHand;
        playerInvertedHand = data.pIHand;
        opponentStandardHand = data.oSHand;
        opponentInvertedHand = data.oIHand;
        currentStPlayingCard = data.cSPcard;
        currentInPlayingCard = data.cIPcard;
        turnToggle = true;

        //update to multiplayer card visuals
        document.getElementById("dark-draw").innerHTML = '<div class="inverted-card clubs" id="filler"></div>';
        document.getElementById("light-draw").innerHTML = '<div class="card clubs" id="filler"></div>';

        //updates the opponents names
        conn.send({ type: 'send-name', pId: myId, fPlayer: false });

        //document.getElementById("multiplayer-screen").className = "screen";
        //document.getElementById("main-game").className = "active";
        loadPageFragment("mainGame.html");

        updateCenterPiles();
        updateDrawPileHover();
        updateInfoCards();

        //dealHands(sDeck, playerStandardHand, opponentStandardHand, "player-main", "opponent-light");
        //dealHands(iDeck, playerInvertedHand, opponentInvertedHand, "player-inactive", "opponent-dark");
        displayHand('player-main', playerStandardHand);
        displayHand('opponent-light', opponentStandardHand);
        displayHand('player-inactive', playerInvertedHand);
        displayHand('opponent-dark', opponentInvertedHand);

        //forces screen to deny clicks
        document.getElementById("no-click-container").innerHTML = `<div class="no-click-screen">${playerNames[0]}'s turn</div>`;

        //ends the other players start loading screen
        conn.send({ type: 'finish-load' });

    } else if (data.type === 'fixParity') {
        // conn.send({ type: 'fixParity', standardDeck: sDeck, invertedDeck: iDeck, pSHand: playerStandardHand, pIHand: playerInvertedHand, 
        // oSHand: opponentStandardHand, oIHand: opponentInvertedHand, cSPcard: currentStPlayingCard, cIPcard: currentInPlayingCard, cP: currentPlayer, 
        // cGS: currentGameState, tT: turnToggle, cSC: currentSelectedCards});
        // cSC: currentSelectedCards.map(c => `${c.rank}-${c.suit}`
        sDeck = data.standardDeck;
        iDeck = data.invertedDeck;
        playerStandardHand = data.pSHand.map(id => {
            const [rank, suit] = id.split('-');
            return playerStandardHand.find(c => c.rank === rank && c.suit === suit);
        });
        playerInvertedHand = data.pIHand.map(id => {
            const [rank, suit] = id.split('-');
            return playerInvertedHand.find(c => c.rank === rank && c.suit === suit);
        });
        opponentStandardHand = data.oSHand;
        opponentInvertedHand = data.oIHand;
        currentSelectedCards = data.cSC.map(id => {
            const [rank, suit] = id.split('-');
            return playerStandardHand.find(c => c.rank === rank && c.suit === suit)
            || playerInvertedHand.find(c => c.rank === rank && c.suit === suit);
        });

        currentStPlayingCard = data.cSPcard;
        currentInPlayingCard = data.cIPcard;
        currentPlayer = data.cP;
        currentGameState = data.cGS;
        turnToggle = data.tT ? false : true;

    } else if (data.type === 'busy') {
      alert('Remote is busy / not accepting connections');
    } else if(data.type === 'finish-load') {
        document.getElementById("no-click-container").innerHTML = "";
    } else if(data.type === 'send-name') {
        remoteId = data.pId;
        conn.send({ type: 'updateOpposingNames', remotePlayerId: myId ,firstPlayer: data.fPlayer });
    } else if(data.type === 'updateOpposingNames') {
        remoteId = data.remotePlayerId;
        if(data.firstPlayer) {
            playerNames = [myId, remoteId];
        } else {
            playerNames = [remoteId, myId];
        }
        updateInfoCards();
    }
  });

  conn.on('close', ()=>{
    conn = null;
    document.getElementById('connState').textContent = 'closed';
    document.getElementById('status').textContnent = 'Connection closed';
  });

  conn.on('error', err=>{
    console.error('Connection error', err);
    alert('Connection error: ' + err);
  });
}   


// --------------------------- INFO CARD UPDATES -------------------------------------------
var playerNames = ["Player 1",  "Player 2"];
function updateInfoCards() {
    //opposing player side
    document.getElementById("opposing-player-name").innerHTML = playerNames[currentPlayer === 0 ? 1 : 0];
    document.getElementById("opposing-player-side").innerHTML = currentGameState[currentPlayer === 0 ? 1 : 0].toUpperCase();
    document.getElementById("opposing-player-light-card-quantity").innerHTML = opponentStandardHand.length;
    document.getElementById("opposing-player-dark-card-quantity").innerHTML = opponentInvertedHand.length;

    //regular player side
    document.getElementById("player-name").innerHTML = playerNames[currentPlayer === 1 ? 1 : 0];
    document.getElementById("player-side").innerHTML = currentGameState[currentPlayer === 1 ? 1 : 0].toUpperCase();
    document.getElementById("player-light-card-quantity").innerHTML = playerStandardHand.length;
    document.getElementById("player-dark-card-quantity").innerHTML = playerInvertedHand.length;
}

    // -------------------- END OF SCRIPTS -------------------------------------------------