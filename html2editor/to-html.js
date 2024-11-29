function sanitizeHtmlString(htmlString) {
    const escapeMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
  
    return htmlString.replace(/[&<>"']/g, (char) => escapeMap[char]);
  }

function processResizableImage(node) {
    return `<img width=${node.getAttribute('width')} height=${node.getAttribute('height')} style="width: ${node.getAttribute('width')}px; height: ${node.getAttribute('height')}px;; object-fit: fit;" src="${node.getAttribute('src')}" />`
}

function processLatexRenderer(node) {
    return `<span latex="${node.getAttribute('value')}">${node.string}</span>`
}

function processTag(node) {
    if (node.tagName === 'BR') return '<br/>'
    return `<${node.tagName.toLowerCase()}>${process(node.childNodes)}</${node.tagName.toLowerCase()}>`
}

function processDiv(node) {
    console.log('div')
    return `<p>${process(node.childNodes)}</p>`
}

function parse(node) {
    const tagName = node.tagName.toLowerCase() 
    if (tagName === 'resizable-img') return processResizableImage(node);
    if (tagName === 'latex-renderer') return processLatexRenderer(node);
    if (tagName === 'div') return processDiv(node)
    return processTag(node)
}

function process(children=[]){
    let text = '';
    for (let i = 0; i < children.length; i++) {
        if (children[i].nodeType === Node.TEXT_NODE) {
            text += sanitizeHtmlString(children[i].textContent);
        } else text += parse(children[i]);
    }
    return text;
}

export default process;