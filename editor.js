/**
 * MIT License
 * Copyright (c) 2017 Musa Ibrahim Ajayi
 **/
import ResizableImage from "./resizable-img";
import LatexRenderer from "./latex-renderer/index.js";
import SymbolPicker from "./symbol-picker/symbol-picker.js";
import { html2Editor, process } from "./html2editor/index.js";
import "mathlive";
import "./node_modules/mathlive/dist/mathlive-static.css";
import "katex/dist/katex.min.css";

customElements.define("latex-renderer", LatexRenderer);
customElements.define("resizable-img", ResizableImage);
customElements.define("symbol-picker", SymbolPicker);

function copyChildNodes(sourceElement, destinationElement) {
  if (!(sourceElement instanceof HTMLElement) || !(destinationElement instanceof HTMLElement)) {
    throw new Error("Both sourceElement and destinationElement must be valid HTML elements.");
  }
  sourceElement.childNodes.forEach((node) => {
    destinationElement.appendChild(node.cloneNode(true));
  });
}

class Editor {
  constructor(node, shadow = null) {
    this.selection = null;
    this.range = null;
    this.node = node;
    this.root = shadow || document;
    this.changeListeners = [];
    this.init();
  }
  addChangeListener(callback) {
    this.changeListeners.push(callback);
  }
  dispatchChangeEvent() {
    this.changeListeners.forEach(callback => callback && callback(this));
  }
  init() {
    this.normalize();
    this.node.contentEditable = true;
    this.node.addEventListener("input", this.handleInput.bind(this));
    this.node.addEventListener("focus", this.handleFocus.bind(this));
    this.node.addEventListener("keydown", this.handleKeydown.bind(this));
  }
  handleInput(e) {
    e.stopPropagation();
    if (this.node.firstChild && this.node.firstChild.tagName !== "P") {
      this.wrapFirstChildInParagraph();
    } else if (!this.node.firstChild) {
      this.createEmptyParagraph();
    }
    this.dispatchChangeEvent();
    return false;
  }
  handleFocus() {
    if (this.node.firstChild && this.node.firstChild.tagName !== "P") {
      this.wrapFirstChildInParagraph();
      this.setSelection();
      this.range = new Range();
      this.range.setStart(this.node.firstChild, 1);
      this.range.setEnd(this.node.firstChild, 1);
      this.selection.removeAllRanges();
      this.selection.addRange(this.range);
      this.range.collapse(true);
    } else if (!this.node.firstChild) {
      this.createEmptyParagraph();
    }
  }
  handleKeydown(e) {
    if (e.key === "Enter") {
      this.handleEnterKey(e);
    } else if (e.key === "Backspace") {
      this.handleBackspaceKey(e);
    }
    this.dispatchChangeEvent();
  }
  handleEnterKey(e) {
    e.preventDefault();
    this.selection = window.getSelection();
    this.range = this.selection.getRangeAt(0);

    if (this.selection.isCollapsed && this.selection.focusOffset === 0) {
      this.handleCollapsedSelection();
      return;
    }

    const startContainer = this.range.startContainer.nodeType === Node.TEXT_NODE
      ? this.range.startContainer.parentElement
      : this.range.startContainer;
    const parentParagraph = startContainer.closest("p");

    if (parentParagraph) {
      this.splitParagraph(parentParagraph);
    } else {
      this.insertNewParagraphAtCurrentPosition();
    }

    this.dispatchChangeEvent();
  }
  reflow(paragraph) {
    const resizableImages = paragraph.querySelectorAll('resizable-img');
    Array.from(resizableImages).forEach(img => {
      const newImg = new ResizableImage();
      newImg.setAttribute('src', img.getAttribute('src'));
      newImg.setAttribute('width', img.getAttribute('width'));
      newImg.setAttribute('height', img.getAttribute('height'));
      try {
        paragraph.replaceChild(newImg, img);
      } catch (e) {
        console.log(e);
      }
      newImg.addEventListener('resize', () => this.dispatchChangeEvent());
      newImg.addEventListener('removed', () => this.dispatchChangeEvent());
    });

    const latexRenderers = paragraph.querySelectorAll('latex-renderer');
    Array.from(latexRenderers).forEach(latex => {
      const newLatex = new LatexRenderer();
      newLatex.setAttribute('value', latex.getAttribute('value'));
      latex.parentNode.replaceChild(newLatex, latex);
      newLatex.hideToolbar();
      newLatex.addEventListener('removed', () => this.dispatchChangeEvent());
    });
  }
  handleBackspaceKey(e) {
    this.setSelection();
    const paragraph = this.getPifSelectionAtBeginning(this.range.startContainer);
    const childs = Array.from(this.node.childNodes);
    if (paragraph === this.node.firstChild && this.range.startOffset === 0) {
      e.preventDefault();
      return false;
    }
    if (this.selection.isCollapsed) {
      if (paragraph
        && this.range.startOffset == 0
        && this.range.startOffset == 0) {
        e.preventDefault();
        const previousSibling = paragraph.previousSibling;
        const lastChild = previousSibling.lastChild;
        copyChildNodes(paragraph, previousSibling);
        paragraph.parentElement.removeChild(paragraph);
        this.reflow(previousSibling);
        this.range.selectNodeContents(lastChild);
        this.range.collapse(false);
        this.selection.removeAllRanges();
        this.selection.addRange(this.range);
      }
    }
  }
  getPifSelectionAtBeginning(element) {
    if (element === this.node)
      return null;
    if (element.nodeType === Node.TEXT_NODE) {
      return this.getPifSelectionAtBeginning(element.parentNode);
    }
    if (element.tagName === 'P') return element;
    const parent = element.parentNode;
    if (!parent.firstChild.textContent)
      return this.getPifSelectionAtBeginning(parent);
    if (parent.firstChild == element)
      return this.getPifSelectionAtBeginning(parent);
    return null;
  }
  handleCollapsedSelection() {
    const oldParagraph = this.getSelectionParagraph();
    const newParagraph = document.createElement("p");
    newParagraph.appendChild(document.createElement("br"));

    if (oldParagraph) {
      this.node.insertBefore(newParagraph, oldParagraph);
    } else {
      this.node.appendChild(newParagraph);
      this.setNewRange(newParagraph);
    }
    this.dispatchChangeEvent();
  }
  splitParagraph(parentParagraph) {
    const splitRange = this.range.cloneRange();
    splitRange.setEndAfter(parentParagraph);
    const afterContent = splitRange.extractContents();


    const newParagraph = document.createElement("p");
    if (afterContent.firstChild.textContent) {
      copyChildNodes(afterContent.firstChild, newParagraph);
    } else {
      newParagraph.appendChild(document.createElement("br"));
    }

    parentParagraph.after(newParagraph);

    this.deleteContentsAfterRange(parentParagraph);
    this.reflow(newParagraph);
    this.setNewRange(newParagraph);
  }
  insertNewParagraphAtCurrentPosition() {
    const newParagraph = document.createElement("p");
    newParagraph.innerHTML = "<br>&nbps;";
    this.range.insertNode(newParagraph);
    this.setNewRange(newParagraph);
  }
  setNewRange(element) {
    const newRange = document.createRange();
    newRange.selectNodeContents(element);
    newRange.setStart(element, 0);
    newRange.setEnd(element, 0);
    newRange.collapse(false);
    this.selection.removeAllRanges();
    this.selection.addRange(newRange);
  }
  deleteContentsAfterRange(parentParagraph) {
    const deleteRange = this.range.cloneRange();
    deleteRange.setStart(this.range.endContainer, this.range.endOffset);
    deleteRange.setEndAfter(parentParagraph);
    deleteRange.deleteContents();
  }
  wrapFirstChildInParagraph() {
    const textNode = this.node.firstChild;
    const paragraph = document.createElement("p");
    this.node.replaceChild(paragraph, textNode);
    paragraph.appendChild(textNode);
  }
  createEmptyParagraph() {
    const textNode = document.createTextNode('\u2009');
    const paragraph = document.createElement("p");
    paragraph.appendChild(textNode);
    this.node.appendChild(paragraph);
  }
  getSelectionParagraph() {
    let anchorNode = this.selection.anchorNode.parentNode;
    do {
      if (anchorNode.tagName === 'P') return anchorNode;
      if (anchorNode === this.node) return null;
      anchorNode = anchorNode.parentNode;
    } while (anchorNode.tagName !== 'P');
    return anchorNode;
  }
  isSelectionWithinEditor() {
    const selection = this.root.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (range.startContainer.tagName === 'LATEX-RENDERER') return false;
      return this.node.contains(range.commonAncestorContainer);
    }
    return false;
  }
  setSelection() {
    if (this.isSelectionWithinEditor()) {
      this.selection = this.root.getSelection();
      this.range = document.createRange();
      try {
        this.range.setStart(this.selection.anchorNode, this.selection.anchorOffset);
        this.range.setEnd(this.selection.focusNode, this.selection.focusOffset);
      } catch (e) { }
    } else {
      this.selection = null;
      this.range = null;
    }
  }
  getText() {
    return process(this.node.childNodes);
  }
  setText(text) {
    this.node.innerHTML = text || "<p><br></p>";
    html2Editor(this.node);
    this.normalize();
    this.addEventListenersToNodes();
  }
  addEventListenersToNodes() {
    const resizableImages = this.node.querySelectorAll("resizable-img");
    const latexRenderers = this.node.querySelectorAll("latex-renderer");
    resizableImages.forEach((node) => {
      node.addEventListener("resize", this.dispatchChangeEvent.bind(this));
      node.addEventListener("removed", this.dispatchChangeEvent.bind(this));
    });
    latexRenderers.forEach((node) => {
      node.addEventListener("removed", this.dispatchChangeEvent.bind(this));
    });
  }
  normalize() {
    const childNodes = Array.from(this.node.childNodes);
    childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE || node.tagName !== 'P') {
        const paragraph = document.createElement('p');
        this.node.replaceChild(paragraph, node);
        paragraph.appendChild(node);
      }
    });
  }
  formatInline(tagName) {
    this.setSelection();
    if (this.hasFormat(tagName) === 0) {
      const el = document.createElement(tagName);
      el.innerHTML = this.selection.toString() || '&thinsp;';
      if (this.selection.focusOffset !== this.selection.anchorOffset) {
        this.selection.deleteFromDocument();
      }
      this.range.collapse(false);
      this.range.insertNode(el);
      this.selection.removeAllRanges();
      this.selection.addRange(this.range);
    }
    this.removeFormat(tagName);
    this.dispatchChangeEvent();
  }
  removeFormat(tagName) {
    for (let i = 1; i <= 3; i++) {
      if (this.hasFormat(tagName) === i) {
        let container = this.range.startContainer;
        for (let j = 0; j < i; j++) {
          container = container.parentNode;
        }
        container.parentNode.replaceChild(container.firstChild, container);
      }
    }
  }
  bold() {
    this.formatInline("B");
  }
  italic() {
    this.formatInline("I");
  }
  underline() {
    this.formatInline("U");
  }
  super() {
    this.formatInline("SUP");
  }
  sub() {
    this.formatInline("SUB");
  }
  formatBlock(element) {
    this.setSelection();
    try {
      const display = window.getComputedStyle(this.range.startContainer.parentNode).display;
      if (display === "block") {
        const el = document.createElement(element);
        el.innerHTML = this.range.startContainer.parentNode.innerHTML;
        this.range.startContainer.parentNode.parentNode.replaceChild(el, this.range.startContainer.parentNode);
      }
    } catch (e) { }
    this.dispatchChangeEvent();
  }
  alignText(align) {
    this.setSelection();
    try {
      const display = window.getComputedStyle(this.range.startContainer.parentNode).display;
      if (display === "block") {
        this.range.startContainer.parentNode.style.textAlign = align;
        this.range.endContainer.parentNode.style.textAlign = align;
        this.selection.removeAllRanges();
        this.selection.addRange(this.range);
      }
    } catch (e) { }
    this.dispatchChangeEvent();
  }
  hasFormat(tag) {
    try {
      const upperTag = tag.toUpperCase();
      let currentNode = this.range.startContainer;
      for (let i = 0; i < 3; i++) {
        if (currentNode.parentNode.nodeName === upperTag) {
          return i + 1;
        }
        currentNode = currentNode.parentNode;
      }
      return 0;
    } catch (e) { }
  }
  insertImage(url) {
    this.setSelection();
    if (this.selection && this.selection.anchorOffset === this.selection.focusOffset) {
      try {
        const img = document.createElement("resizable-img");
        img.contentEditable = false;
        const space = document.createTextNode("\u2009");
        img.setAttribute("src", url);
        img.setAttribute("width", 300);
        img.setAttribute("height", 300);
        this.range.insertNode(img);
        this.range.setStartAfter(img);
        this.range.collapse(true);
        this.range.insertNode(space);
        this.dispatchChangeEvent();
        img.addEventListener("removed", this.dispatchChangeEvent.bind(this));
        img.addEventListener("resize", this.dispatchChangeEvent.bind(this));
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log('no');
    }
  }
  insertBase64Image() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64String = event.target.result;
          this.insertImage(base64String);
        };
        reader.readAsDataURL(file);
      }
      document.body.removeChild(fileInput);
    });
    fileInput.click();
  }
  insertMathML() {
    this.setSelection();
    const space = document.createTextNode("\u2009");
    const mathElement = document.createElement("latex-renderer");
    if (this.selection && this.selection.anchorOffset === this.selection.focusOffset) {
      this.range.insertNode(mathElement);
      this.range.setStartAfter(mathElement);
      this.range.collapse(true);
      this.range.insertNode(space);
      mathElement.focus();
      this.dispatchChangeEvent();
      mathElement.addEventListener("removed", this.dispatchChangeEvent.bind(this));
    }
  }
  insertSymbol() {
    this.setSelection();
    if (this.selection && this.selection.anchorOffset === this.selection.focusOffset) {
      try {
        const symbolPicker = document.createElement("symbol-picker");
        document.body.appendChild(symbolPicker);
        symbolPicker.addEventListener("insert", (e) => {
          const symbol = symbolPicker.value;
          const node = document.createTextNode(symbol);
          this.range.insertNode(node);
          this.dispatchChangeEvent();
          document.body.removeChild(symbolPicker);
        });
      } catch (e) { }
    }
  }
  insertList(type) {
    this.setSelection();
    try {
      const list = document.createElement(type);
      const listItem = document.createElement("li");
      list.appendChild(listItem);
      this.range.collapse(false);
      this.range.insertNode(list);
    } catch (e) { }
  }
}

export default Editor;