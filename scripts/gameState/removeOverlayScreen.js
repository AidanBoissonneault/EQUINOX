export function hideOverlayScreen(firstTime = false) {
    const overlay = document.getElementById("overlay-screen-container");
    if (!overlay) throw new Error("to hide an overlay screen, an overlay screen must exist.");
    if (overlay.classList.contains("no-display")) throw new Error("overlay screen is already hidden");

    overlay.innerHTML = "";
    overlay.classList.add("no-display");
}