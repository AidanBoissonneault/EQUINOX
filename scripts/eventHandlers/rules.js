import { addExpandBoxEventListeners } from "../utilities/expandBox.js";

export function addRulesBox() {
    const documentId = "expand-box";
    const closedText = "RULES";
    const openText =  `
                <h1>RULES</h1>
                <p id="rules-text">
                    The knight must land on each square exactly once.
                    <br>If the knight rules out of possible moves... 
                    <br>YOU LOSE! thats it!
                    <br>Enjoy!
                </p>`;
    addExpandBoxEventListeners(documentId, closedText, openText);
}