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
            winningPlayer = currentPlayer === State.FIRST_PLAYER ? State.SECOND_PLAYER : State.FIRST_PLAYER;
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
        currentPlayer = currentPlayer == State.FIRST_PLAYER ? State.SECOND_PLAYER : State.FIRST_PLAYER;

        //animate info boxs
        document.getElementById("player-zone-full").classList.toggle("animated-player-zone");
        document.getElementById("opposing-player-zone-full").classList.toggle("animated-opposing-player-zone");

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
        if (isMultiplayer && turnToggle) {
            document.getElementById("no-click-container").innerHTML = "";

            turnToggle = false;
        } else if (isMultiplayer) {
            document.getElementById("no-click-container").innerHTML = `<div class="no-click-screen">${playerNames[currentPlayer]}'s turn</div>`;
            turnToggle = true;
        }
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
        if (currentGameState[currentPlayer] === State.STANDARD) {
            //standard deck
            for (let standardCard of playerStandardHand) {
                /*
                if (standardCard.value === currentStPlayingCard.value ||
                    standardCard.value === currentInPlayingCard.value ||
                    alternateSuits(currentStPlayingCard.suit).includes(standardCard.suit) ||
                    standardCard.suit === currentInPlayingCard.suit) {
                        console.log(`Playable card: ${standardCard.rank} ${standardCard.suit}`);
                        return [standardCard];
                    } */
                if (standardCard.value === currentStPlayingCard.value ||
                    standardCard.value === currentInPlayingCard.value ||
                    standardCard.suit === currentStPlayingCard.suit ||
                    standardCard.suit === currentInPlayingCard.suit) {
                        const outputHand = [standardCard];
                        for (let standardCardEmbedded of playerStandardHand) {
                            if (standardCard.value === standardCardEmbedded.value && 
                                (() => {
                                    for (let cards of outputHand) {
                                        if (cards.suit === standardCardEmbedded.suit) return false;
                                    }
                                    return true;
                                })()
                            ) { outputHand.push(standardCardEmbedded); }
                        }
                        console.log(`Playable card: ${standardCard.rank} ${standardCard.suit}`);
                        return outputHand;
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