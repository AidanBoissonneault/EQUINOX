// -------------- PEER.JS CONNECTION LOGIC -----------------------
// - THIS FILE USES THE DEFAULT PeerServer (cloud) FOR SIGNALING -
// - AND DOES NOT WORK ON THE SCHOOL WIFI, AS webRTC IS BLOCKED. -
// ---------------------------------------------------------------
    

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
    myId = document.getElementById('myId').value;
    if (myId === "") myId = makeSimpleId();
  peer = new Peer(myId); // default PeerServer (cloud) for signaling
  peer.on('open', id=>{
    document.getElementById('myId').value = id;
    document.getElementById('myId').disabled = true;
    document.getElementById('create-button').disabled = true;
    document.getElementById('connection-status').textContent = 'listening';
  });
  peer.on('connection', incoming=>{
    if (conn) {
      incoming.on('open', ()=>incoming.send({type:'busy'}));
      return;
    }
    // initialize as the host
    setupConnection(incoming);
  });
  peer.on('error', err=>{
    console.error('Peer error', err);
    alert('Peer error: ' + err);
  });
}

let myId = ""; //stores player connection id
let remoteId = ""; //stores opponent connection id

function createNewPeer(myId) {
    return new Promise((resolve, reject) => {
        const theCreatedPeer = new Peer(myId);
        theCreatedPeer.on('open', id => {
            document.getElementById('myId').textContent = id;
            return resolve(theCreatedPeer);
        });
        theCreatedPeer.on('error', theError => { return reject(theError) });
    });
}

async function connectButtonLogic() {
    remoteId = document.getElementById('remoteId').value.trim();
    if (!myId) myId = makeSimpleId();

    //checks if a peer exists, if no, create a new one.
    if (!remoteId) return alert('Enter remote peer id');
    if (!peer) {
        try {
            peer = await createNewPeer(myId);
            document.getElementById('myId').value = myId;
            document.getElementById('myId').disabled = true;
            document.getElementById('create-button').disabled = true;
        } catch (theError) {
            console.error(theError);
        }
    }
    if (conn) conn.close();
    const outgoing = peer.connect(remoteId, {reliable:true});
    setupConnection(outgoing);
};

function setupConnection(connection){
    conn = connection;
    conn.on('open', ()=>{
        document.getElementById('connection-status').textContent = 'connected';
        document.getElementById('start-button').disabled = false;
        document.getElementById("start-button").innerHTML = "START GAME";
        document.getElementById('multiplayer-back-button').disabled = true;
        document.getElementById('connect-button').disabled = true;
        document.getElementById('remoteId').disabled = true;
    });

    conn.on('data', data=>{
        if (!data || !data.type) return;
        if (data.type === 'selectCard') {
            selectCard(data.sentCard, RETURNED_PLAYER_CALL);
        } else if (data.type === 'sort') {
            playerStandardHand = data.pSHand;
            playerInvertedHand = data.pIHand;
            displayHand('player-main', currentGameState[currentPlayer] === "standard" ? playerStandardHand : playerInvertedHand);
            displayHand('player-inactive', currentGameState[currentPlayer] === "standard" ? playerInvertedHand : playerStandardHand);
        } else if (data.type === 'draw') {
            drawButton(RETURNED_PLAYER_CALL);
        } else if (data.type === 'play') {
            playButtonActivate(RETURNED_PLAYER_CALL);
        } else if (data.type === 'start') {
            startSecondaryGame(data);
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
            if (currentGameState[currentPlayer] !== data.cGS[currentPlayer]) visualFlipGame();
            currentGameState = data.cGS;
            turnToggle = data.tT ? false : true;

            if (currentGameState[currentPlayer] === State.STANDARD) {
                displayHand('player-main', playerStandardHand);
                displayHand('player-inactive', playerInvertedHand);
            } else {
                displayHand('player-main', playerInvertedHand);
                displayHand('player-inactive', playerStandardHand);
            }
                displayHand('player-inactive', playerInvertedHand);
                displayHand('opponent-dark', opponentInvertedHand);

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
        } else if(data.type === 'helpButtonPressed') {
            helpButton(RETURNED_PLAYER_CALL);
        }
  });

  conn.on('close', ()=>{
    conn = null;
    document.getElementById('connection-status').textContent = 'closed';
  });

  conn.on('error', err=>{
    console.error('Connection error', err);
    alert('Connection error: ' + err);
  });
}   

// ------------------- START SECONDARY GAME -------------------------------------------

async function startSecondaryGame(data) {
        //conn.send({ type: 'start', standardDeck: sDeck, invertedDeck: iDeck, pSHand: playerStandardHand, pIHand: playerInvertedHand, oSHand: opponentStandardHand, oIHand: opponentInvertedHand, cSPcard: currentStPlayingCard, cIPcard: currentInPlayingCard});

    await loadPageFragment("mainGame.html");


    //re-enables auto end turn for speed 
    settings.autoDraw = true;
    
    
    sDeck = data.standardDeck;
    iDeck = data.invertedDeck;
    playerStandardHand = data.pSHand;
    playerInvertedHand = data.pIHand;
    opponentStandardHand = data.oSHand;
    opponentInvertedHand = data.oIHand;
    currentStPlayingCard = data.cSPcard;
    currentInPlayingCard = data.cIPcard;
    turnToggle = true;

    //logic for when games replay
    cardIdIteratorLight = 0;
    cardIdIteratorDark = DECK_SIZE;

    //add the flip fix aidan
    currentGameState[State.FIRST_PLAYER] = State.STANDARD;
    currentGameState[State.SECOND_PLAYER] = State.STANDARD;

    //creates draw pile visual
    generateDrawPiles();

    //updates the opponents names
    conn.send({ type: 'send-name', pId: myId, fPlayer: false });

    //document.getElementById("multiplayer-screen").className = "screen";
    //document.getElementById("main-game").className = "active";
    

    const FLASH_YELLOW = true;
    const FIRST_TIME_USED = true;
    updateCenterPiles(FLASH_YELLOW, FIRST_TIME_USED);
    updateInfoCards();
    fixSortButtonLogic();

    //dealHands(sDeck, playerStandardHand, opponentStandardHand, "player-main", "opponent-light");
    //dealHands(iDeck, playerInvertedHand, opponentInvertedHand, "player-inactive", "opponent-dark");
    displayHand('player-main', playerStandardHand);
    displayHand('opponent-light', opponentStandardHand);
    displayHand('player-inactive', playerInvertedHand);
    displayHand('opponent-dark', opponentInvertedHand);

    //forces screen to deny clicks
    document.getElementById("no-click-container").innerHTML = `<div class="no-click-screen">${playerNames[State.FIRST_PLAYER]}'s turn</div>`;

    //ends the other players start loading screen
    conn.send({ type: 'finish-load' });
}