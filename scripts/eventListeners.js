function addAbsoluteButtonEventListeners() {
    const absoluteButtons = document.querySelectorAll('.absolute-button');
    if (!absoluteButtons) return;

    absoluteButtons.forEach(absoluteButton => {
        let isHover = false;

        absoluteButton.addEventListener('transitionstart', () => {
            absoluteButton.classList.remove('show-after');
        });

        absoluteButton.addEventListener('transitionend', () => {
            if (isHover) absoluteButton.classList.add('show-after');
        });

        absoluteButton.addEventListener('mouseleave', () => {
            isHover = false;
        })
        
        absoluteButton.addEventListener('mouseenter', () => {
            isHover = true;
        })
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
        if (isHover) isTransitionEnd = true;
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