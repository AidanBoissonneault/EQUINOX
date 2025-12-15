import { VisualKnight } from "../visuals/knightVisual.js";
import { gameState } from "../gameState/gameState.js";
import { tileState } from "../tileLogic/tile.js";
import { renderTiles } from "../visuals/tileRenderer.js";
import { removeFailedTiles } from "../visuals/failedGame.js";
import { endGame } from "../gameState/loseGame.js";

export const knightMoveReference = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];

export class Knight {
    #position = { x: 0, y: 0 };

    #visual;
    #previousPositions = [];

    constructor(x, y) {
        if (x >= gameState.boardSize) throw new Error(`x must be within the board size (0-${gameState.boardSize-1})`);
        if (y >= gameState.boardSize) throw new Error(`y must be within the board size (0-${gameState.boardSize-1})`);
        this.#position = { x, y };
        this.#visual = new VisualKnight(x, y);
    }

    get x() {
        return this.#position.x;
    }

    get y() {
        return this.#position.y;
    }

    get visual() {
        return this.#visual;
    }

    move(position) {
        if (position.x == null || position.y == null) throw new Error("position must be a position struct.");
        this.move(position.x, position.y);
    }

    move(x, y) {
        if (x < 0 || x >= gameState.boardSize ||
            y < 0 || y >= gameState.boardSize
        ) {
            throw new Error("The knight must move in the board");
        }
        if (gameState.tileMap[x][y].state === tileState.VISITED)
            throw new Error("The knight must move to an unvisted square");

        for (const [dx, dy] of knightMoveReference) {
            if (this.#position.x + dx === x &&
                this.#position.y + dy === y) {

                this.#previousPositions.push({ 
                    x: this.#position.x, 
                    y: this.#position.y 
                }); // add the current move to the previous moves array before leaving

                gameState.tileMap[this.#position.x][this.#position.y].state = tileState.VISITED;

                this.#position.x = x;
                this.#position.y = y;
                this.#visual.move(x, y);
                console.log(`Moved to X: ${x}, Y:${y}`);
                gameState.tileMap[x][y].state = tileState.VISITING;
                let lostGame = renderTiles();

                if (!lostGame)
                    endGame();

                return;
            }
        }
        //throw new Error("The move was not within knights reach");
    }

    undo() {
        if (this.#previousPositions.length === 0) throw new Error("Must have previous moves to use undo");

        const current = { ...this.#position };
        const previous = this.#previousPositions.pop();

        // reset current tile
        gameState.tileMap[current.x][current.y].state = tileState.UNVISITED;

        // move knight WITHOUT validation or history mutation
        this.#position.x = previous.x;
        this.#position.y = previous.y;

        const REVERSED = true;
        this.#visual.move(previous.x, previous.y, REVERSED);

        // restore visiting state
        gameState.tileMap[previous.x][previous.y].state = tileState.VISITING;

        renderTiles();
        removeFailedTiles();
    }
}