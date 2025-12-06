//loads the entire standard deck of cards, any ingame
    function generateDeck(deck, type) {
        const suits = ["hearts", "clubs", "diamonds", "spades"];
        const rankName = ["ace", "two", "three", "four", "five",
                        "six", "seven", "eight", "nine", "ten",
                        "jack", "queen", "king"];

        for (let i = 0; i < suits.length; i++) {
            for (let j = 0; j < rankName.length; j++) {
                deck.push(new Card(type, suits[i], rankName[j], j+1));
            }
        }
    }

    function shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]]; //swap without temp variables
        }
    }   

    

    //boots up at the start of game, shuffles decks, changes screens, etc
    async function startGame() {
        await loadPageFragment("mainGame.html");

        //if the help button is enabled, show the help button, overwise dont!
        if (!settings.showHelpButton) {
            document.getElementById("help-container").classList.add('no-display');
        }

        if (isMultiplayer) {
            document.getElementById("no-click-container").innerHTML = '<div class="no-click-screen">Loading...</div>';

            //re-enables auto end turn for speed 
            settings.autoDraw = true;
        }

        sDeck = [];
        iDeck = [];
        generateDeck(sDeck, "standard");
        generateDeck(iDeck, "inverted");
        shuffleDeck(sDeck);
        shuffleDeck(iDeck);

        //adds visuals (testing)
        generateDrawPiles();
        
        fixSortButtonLogic();
        
        await dealBothDecks();

        currentStPlayingCard = sDeck.pop();
        currentInPlayingCard = iDeck.pop();
        const FLASH_YELLOW = true;
        const FIRST_TIME_USED = true;
        updateCenterPiles(FLASH_YELLOW, FIRST_TIME_USED);
        updateDrawPileHover();

        if (isMultiplayer) {
            turnToggle = false;
            if (conn && conn.open) { conn.send({ type: 'send-name', pId: myId, fPlayer: RETURNED_PLAYER_CALL }); }
            if (conn && conn.open) {
                conn.send({ type: 'start', standardDeck: sDeck, invertedDeck: iDeck, 
                    pSHand: playerStandardHand, pIHand: playerInvertedHand, oSHand: opponentStandardHand, oIHand: opponentInvertedHand, 
                    cSPcard: currentStPlayingCard, cIPcard: currentInPlayingCard});
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
        playerNames[State.SECOND_PLAYER] = "BOT";
        await startGame();
        updateInfoCards();
    }
