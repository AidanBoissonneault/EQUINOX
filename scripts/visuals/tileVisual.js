import { Boolean } from "../utilities/booleanToggler.js";
import { gameState } from "../gameState/gameState.js";
import { tileState } from "../tileLogic/tile.js";

export const visualTileDimensions = Object.freeze({
    sizeX: 85,
    sizeY: 75,
});

const visualTileColors = Object.freeze({
    LIGHT: '#ddd',
    DARK: '#444',

    LIGHT_SHADOW: '#ccc',
    DARK_SHADOW: '#333'
});

export class VisualTile {
    #offsetX;
    #offsetY;

    static #colorCycler;
    static #colorCounter;
    #colorScheme;
    #colorSchemeSecondary;

    #documentId = null;
    #state = null;

    constructor(x, y) {
        if ( x == null || y == null ) throw new Error("You must input an X and Y");
        this.#offsetX = visualTileDimensions.sizeX * x;
        this.#offsetY = visualTileDimensions.sizeY * y; 

        this.#state = tileState.UNVISITED;

        if (VisualTile.#colorCycler == null || VisualTile.#colorCounter == null) { //creates the static cycler
            VisualTile.#colorCycler = false;
            VisualTile.#colorCounter = 0;
        }

        this.#colorScheme = 
                                    VisualTile.#colorCycler ? 
                                    visualTileColors.LIGHT : 
                                    visualTileColors.DARK;
        this.#colorSchemeSecondary = 
                                    VisualTile.#colorCycler ? 
                                    visualTileColors.LIGHT_SHADOW : 
                                    visualTileColors.DARK_SHADOW;
        
        //cycles the color cycler back and forth
        //with just toggling back and forth, it causes visual errors on even sized boards.
        //to make it worth with both, we iterate a counter that skips some color flips.
        if (gameState.boardSize % 2 === 0 && VisualTile.#colorCounter === gameState.boardSize-1) {
            VisualTile.#colorCounter = -1;
        } else {
            VisualTile.#colorCycler = Boolean.toggle(VisualTile.#colorCycler);
        }
        if (gameState.boardSize % 2 == 0)
            VisualTile.#colorCounter++;
    }

    get offsetX() {
        return this.#offsetX;
    }

    get offsetY() {
        return this.#offsetY;
    }

    get colorScheme() {
        return this.#colorScheme;
    }
    
    get colorSchemeSecondary() {
        return this.#colorSchemeSecondary;
    }

    set documentId(newId) {
        this.#documentId = newId;
    }

    get documentId() {
        return this.#documentId;
    }

    set state(nextState) {
        if ( nextState == null ) throw new Error("A visual state cannot be null/undefined");
         if ( nextState !== tileState.UNVISITED && nextState !== tileState.VISITING && 
            nextState !== tileState.VISITED ) 
            throw new Error("The state must be a valid state");
        this.#state = nextState;

        this.#documentId.classList.remove("visiting", "visited", "target");
        switch(this.#state) {
            case tileState.VISITING:
                this.#documentId.classList.add("visiting");
                return;
            case tileState.VISITED:
                this.#documentId.classList.add("visited");
                return;
        }
    }

    get state() {
        return this.#state;
    }
};