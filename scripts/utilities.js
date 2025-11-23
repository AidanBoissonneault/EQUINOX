function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//loads a screen
async function loadPageFragment(file) {
    const html = await fetch(file).then(res => res.text());
    document.getElementById("actual-body").innerHTML = html;
}

loadPageFragment("html/titleScreen.html");