function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//loads a screen
async function loadPageFragment(file, path = "/EQUINOX/html/") {
    const html = await fetch(path+file).then(res => res.text());
    document.getElementById("actual-body").innerHTML = html;
}

loadPageFragment("titleScreen.html");