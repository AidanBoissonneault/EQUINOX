function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//loads a screen
async function loadPageFragment(file) {
    const PATH = "./html/";
    const fileObject = await fetch(PATH+file);
    //const html = await fetch(PATH+file).then(res => res.text());
    const html = await fileObject.text();
    document.getElementById("actual-body").innerHTML = html;
}

loadPageFragment("titleScreen.html");