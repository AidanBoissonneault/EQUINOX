 // ------------------------------ ANIMATIONS ------------------------------------------

    async function buttonFlashRed(buttonId) {
        document.getElementById(buttonId).classList.add("flash");
        await delay(400);
        document.getElementById(buttonId).classList.remove("flash");
    }