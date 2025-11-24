function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//loads a screen
async function loadPageFragment(file, documentId = "actual-body") {
    const PATH = "./html/";
    const fileObject = await fetch(PATH+file);
    //const html = await fetch(PATH+file).then(res => res.text());
    const html = await fileObject.text();
    document.getElementById(documentId).innerHTML = html;
}

loadPageFragment("titleScreen.html");