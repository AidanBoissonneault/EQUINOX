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

        if (isMultiplayer) {
            document.getElementById("dark-draw").innerHTML = '<div class="inverted-card clubs" id="filler"></div>';
            document.getElementById("light-draw").innerHTML = '<div class="card clubs" id="filler"></div>';
            document.getElementById("no-click-container").innerHTML = '<div class="no-click-screen">Loading...</div>';
        }

        generateDeck(sDeck, "standard");
        generateDeck(iDeck, "inverted");
        shuffleDeck(sDeck);
        shuffleDeck(iDeck);
        
        await dealBothDecks();

        currentStPlayingCard = sDeck.pop();
        currentInPlayingCard = iDeck.pop();
        updateCenterPiles();
        updateDrawPileHover();

        if (isMultiplayer) {
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
