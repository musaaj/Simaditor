function html2Editor(parent) {
    const children = parent.children;

    for (let i = 0; i < children.length; i++) {
        const child = children[i];

        if (child.tagName === "IMG") {
            replaceWithResizableImage(parent, child);
            i--;
        } else if (child.tagName === "DIV") {
            replaceWithPTag(parent, child);
            i--;
        } else if (child.tagName === "SPAN" && child.hasAttribute("latex")) {
            replaceWithLatexRenderer(parent, child);
            i--;
        } else if (child.tagName === "RESIZABLE-IMG" || child.nodeType === Node.TEXT_NODE) {
            continue;
        } else {
           html2Editor(child);
        }
    }
}

function replaceWithResizableImage(parent, img) {
    const resizableImage = document.createElement("resizable-img");
    resizableImage.setAttribute('contentEditable', false);
    resizableImage.setAttribute('width', img.getAttribute('width') || '200');
    resizableImage.setAttribute('height', img.getAttribute('height') || '200');
    resizableImage.setAttribute('src', img.getAttribute('src'));
    parent.replaceChild(resizableImage, img);
}

function replaceWithPTag(parent, div) {
    const pTag = document.createElement("p");
    copyAttributes(div, pTag);
    moveChildNodes(div, pTag);
    parent.replaceChild(pTag, div);
}

function copyAttributes(source, target) {
    Array.from(source.attributes).forEach(attr => {
        target.setAttribute(attr.name, attr.value);
    });
}

function moveChildNodes(source, target) {
    while (source.firstChild) {
        target.appendChild(source.firstChild);
    }
}

function replaceWithLatexRenderer(parent, span) {
    const latexRenderer = document.createElement("latex-renderer");
    const latexValue = span.getAttribute("latex");
    latexRenderer.setAttribute("value", latexValue);
    latexRenderer.setAttribute('contentEditable', false)
    parent.replaceChild(latexRenderer, span);
    latexRenderer.hideToolbar()
}

export default html2Editor;