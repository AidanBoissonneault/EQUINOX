import { VisualTile } from "../visuals/tileVisual.js";
import { checkWin, winGame } from "../gameState/winGame.js";

export const tileState = Object.freeze({
    UNVISITED: 0,
    VISITING: 1,
    VISITED: 2
});

export class Tile {
    #position = {
        x: 0,
        y: 0
    };
    #state;
    #visual; //stores a VisualTile object

    constructor(x, y) {
        if ( x == null || y == null ) throw new Error("X and Y cannot be null/undefined");
        this.x = x;
        this.y = y;
        this.#state = tileState.UNVISITED;

        this.#visual = new VisualTile(x, y);
    }
    
    get position() {
        return this.#position;
    }

    get state() {
        return this.#state;
    }

    set state(nextState) {
        if ( this.#state !== tileState.UNVISITED && this.#state !== tileState.VISITING && 
            !(nextState === tileState.UNVISITED && this.#state === tileState.VISITED) &&
            !(nextState === tileState.VISITING && this.#state === tileState.VISITED)) throw new Error("You can only move to an unvisited tile");
        if ( nextState == null ) throw new Error("A state cannot be null/undefined");
        if ( nextState !== tileState.UNVISITED && 
            nextState !== tileState.VISITING && 
            nextState !== tileState.VISITED ) 
            throw new Error("The state must be a valid state");
        
        this.verifyWin(nextState);
        this.#state = nextState;

        this.#visual.state = nextState;
    }

    get visual() {
        return this.#visual;
    }

    verifyWin(nextState) {
        if (nextState === tileState.VISITING && this.#state === tileState.UNVISITED) {
            console.log("visted a new tile");
            if (checkWin(this.x, this.y))
                winGame();
        }
    }
}