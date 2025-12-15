export function addExpandBoxEventListeners(documentId, closedText, openText) {
    const expandBox = document.getElementById(documentId);
    if (!expandBox) return;

    let isHover = false;
    let isTransitionEnd = false;

    const tryExpandBox = () => {
        if (isHover && isTransitionEnd) {
            console.log("activated!");
            expandBox.innerHTML = openText;
        } else if (isHover) {
            expandBox.innerHTML = "";
        } else {
            expandBox.innerHTML = closedText;
        }
    }

    expandBox.addEventListener('transitionstart', () => { 
        isTransitionEnd = false;
        tryExpandBox();
    });
    expandBox.addEventListener('transitionend', () => { 
        if (isHover) isTransitionEnd = true;
        tryExpandBox();
    });
    expandBox.addEventListener('mouseleave', () => { 
        isHover = false;
        tryExpandBox();
    });
    expandBox.addEventListener('mouseenter', () => { 
        isHover = true;
        tryExpandBox();
    });

    tryExpandBox();
}