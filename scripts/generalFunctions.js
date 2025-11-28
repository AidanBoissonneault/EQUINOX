

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

let isFlippingDecks = false;
async function flipDecks() {
    //checks if the current deck it is flipping to is empty
    //if it is empty, do not flip.
    if (currentGameState[currentPlayer] == "standard" && playerInvertedHand.length == 0 ||
            currentGameState[currentPlayer] == "inverted" && playerStandardHand.length == 0) {
        return;
    }

    //delay for animation, adds animation
    document.getElementById("player-zone-full").classList.toggle("animated-player-zone");
    isFlippingDecks = true;

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


    const isStandard = currentGameState[currentPlayer] === "standard";

    const playerCardMain = document.getElementById("player-cards-main");
    playerCardMain.classList.remove("player-cards-light", "player-cards-dark");
    playerCardMain.classList.add(isStandard ? "player-cards-light" : "player-cards-dark");

    const playerCardInverted = document.getElementById("player-cards-inactive");
    playerCardInverted.classList.remove("player-cards-light", "player-cards-dark");
    playerCardInverted.classList.add(!isStandard ? "player-cards-light" : "player-cards-dark");

    const background = document.getElementById("background-color-display");
    background.classList.remove("background-white", "background-black");
    background.classList.add(isStandard ? "background-white" : "background-black");

    const lightDiscard = document.getElementById("light-discard");
    lightDiscard.classList.remove("light-discard", "light-center");
    lightDiscard.classList.add(!isStandard ? "light-discard" : "light-center");

    const darkDiscard = document.getElementById("dark-discard");
    darkDiscard.classList.remove("dark-discard", "dark-center");
    darkDiscard.classList.add(isStandard ? "dark-discard" : "dark-center");

    const mainGame = document.getElementById("main-game");
    mainGame.classList.remove("text-white", "text-black");
    mainGame.classList.add(isStandard ? "text-black" : "text-white");

    //fixes sort button logic
    fixSortButtonLogic();

    //fixes the current flashing card in edge cases
    setVisualSelectedCard("noCard");

    //updates the player info cards
    updateInfoCards();

    //animation removal
    await delay(400);
    document.getElementById("player-zone-full").classList.toggle("animated-player-zone");
    isFlippingDecks = false;
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


// ---------------------------------- REPLAY BUTTON ---------------------------------------------


const BACK_TO_MENU = true;
async function replayGame(backToMenu = false) {
    currentPlayer = State.FIRST_PLAYER;
    currentInPlayingCard = 0;
    currentStPlayingCard = 0;
    currentSelectedCards = [];
    playerStandardHand = [];
    opponentStandardHand = [];
    playerInvertedHand = [];
    opponentInvertedHand = [];

    cardIdIteratorLight = 0;
    cardIdIteratorDark = DECK_SIZE;

    currentGameState[State.FIRST_PLAYER] = State.STANDARD;
    currentGameState[State.SECOND_PLAYER] = State.STANDARD;

    if (backToMenu) {
        await loadPageFragment("titleScreen.html");
        conn = undefined;
        isMultiplayer = false;
    } else {
        startGame();
    }
}
  