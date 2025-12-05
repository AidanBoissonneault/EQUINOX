function addAbsoluteButtonEventListeners() {
    const absoluteButtons = document.querySelectorAll('.absolute-button');
    if (!absoluteButtons) return;

    absoluteButtons.forEach(absoluteButton => {
        absoluteButton.addEventListener('transitionstart', () => {
            absoluteButton.classList.remove('show-after');
        });

        absoluteButton.addEventListener('transitionend', () => {
            absoluteButton.classList.add('show-after');
        });
    })
}

function addHelpButtonEventListeners() {
    const helpButton = document.getElementById('help-container');
    if (!helpButton) return;

    let isHover = false;
    let isTransitionEnd = false;

    helpButton.addEventListener('transitionstart', () => { 
        isTransitionEnd = false;
        tryActivateHelpButton(helpButton, isHover, isTransitionEnd);
    });
    helpButton.addEventListener('transitionend', () => { 
        isTransitionEnd = true;
        tryActivateHelpButton(helpButton, isHover, isTransitionEnd);
    });
    helpButton.addEventListener('mouseleave', () => { 
        isHover = false;
        tryActivateHelpButton(helpButton, isHover, isTransitionEnd);
    });
    helpButton.addEventListener('mouseenter', () => { 
        isHover = true;
        tryActivateHelpButton(helpButton, isHover, isTransitionEnd);
    });

    tryActivateHelpButton(helpButton, isHover, isTransitionEnd);
}

function tryActivateHelpButton(helpButton, isHover, isTransitionEnd) {
    if (isHover && isTransitionEnd) {
        console.log("activated!");
        helpButton.innerHTML = `
            <h1>NEED HELP?</h1>
            <p id="help-text">
                Click the button below to select a playable hand! <br>
                (as long as one exists) <br>
                I refuse to explain why this is a playable hand... <br>
                read the rules!
            </p>
            <button id="help-button" onclick="helpButton()">CLICK ME!</button>`;
    } else if (isHover) {
        helpButton.innerHTML = "";
    } else {
        helpButton.innerHTML = `HELP`;
    }
}