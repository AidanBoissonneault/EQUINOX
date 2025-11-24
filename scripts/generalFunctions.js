

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

  