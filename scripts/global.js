//if the player is vs a bot or 2 player
    var isAgainstBot = false;

    //if the player is playing against a local opponent
    var isMultiplayer = false;

    //deck references
    var sDeck = []; //standard deck
    var iDeck = []; //inverted deck

    //stores hand info
    const HAND_SIZE = 7; //drawing hand size
    const TOTAL_START_GAME_TIME = 1500;
    const DELAY_BETWEEN_DRAWN_CARDS = TOTAL_START_GAME_TIME / HAND_SIZE;

    const FIRST_PLAYER_SENDING_INFO = false;
    const RETURNED_PLAYER_CALL = true;

    const State = Object.freeze({
        STANDARD: "standard",
        INVERTED: "inverted",
        FIRST_PLAYER: 0,
        SECOND_PLAYER: 1
    });


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
    var currentPlayer = State.FIRST_PLAYER;

    class Card {
        constructor(type, suit, rank, value) {
            this.type = type;
            this.suit = suit;
            this.rank = rank;
            this.value = value;
        }
    }