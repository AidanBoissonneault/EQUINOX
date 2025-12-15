export async function loadPageFragment(file, documentId) {

    const element = document.getElementById(documentId);
    if (!element) throw new Error("documentId must refer to the id of an element");
    element.classList.remove("no-display");

    const PATH = "./html/";
    const fileObject = await fetch(PATH+file);
    const html = await fileObject.text();
    element.innerHTML = html;
}