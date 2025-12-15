import { Tile } from "./tile.js";

export function generateMap(boardSize) {

    let tempMap = [];
    for (let i = 0; i < boardSize; i++) {
        let tempColumn = [];
        for (let j = 0; j < boardSize; j++) {
            let tempTile = new Tile(i, j);
            tempColumn.push(tempTile);
        }
        tempMap.push(tempColumn);
    }
    return tempMap;
}