/**
 * MIT License
 * Copyright (c) 2017 Musa Ibrahim Ajayi
 **/
import ResizableImage from "./resizable-img";
import LatexRenderer from "./latex-renderer/index.js";
import SymbolPicker from "./symbol-picker/symbol-picker.js";
import { html2Editor, process } from "./html2editor/index.js"
import "mathlive";
import "./node_modules/mathlive/dist/mathlive-static.css";
import "./katex/katex/katex.min.css";
customElements.define("latex-renderer", LatexRenderer);
customElements.define("resizable-img", ResizableImage);
customElements.define("symbol-picker", SymbolPicker)

function wrapFirstPartWithP(htmlString) {
  const firstPIndex = htmlString.indexOf('<p>');
  const endIndex = firstPIndex === -1 ? htmlString.length : firstPIndex;

  const wrappedString = '<p>' + htmlString.slice(0, endIndex) + '</p>' + htmlString.slice(endIndex);

  return wrappedString;
}


function Editor(node, shadow = null) {
  this.selection = null;
  this.range = null;
  const self = this;
  self.imageResizable = false;
  this.node = node;
  const root = shadow || document;

  /**
   * Initializes the editor by setting the contentEditable property and adding default content.
   */
  this.init = function () {
    this.node.contentEditable = true;
    this.node.addEventListener('keydown', e=>{
      if(e.key == 'Enter'){
        e.preventDefault();
        const p = document.createElement('p');
        p.innerHTML = '&thinsp;'

        this.setSelection();
        this.range = this.selection.getRangeAt(0);
        this.range.deleteContents()
        this.range.insertNode(p);

        this.range.setStart(p, 0);
        this.range.setEnd(p, 0);

        this.selection.removeAllRanges()
        this.selection.addRange(this.range)
      }
    })
  };

  /**
   * Checks if the current selection is within the editor node.
   * @returns {boolean} True if the selection is within the editor, false otherwise.
   */
  this.isSelectionWithinEditor = function () {
    const selection = root.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      return this.node.contains(range.commonAncestorContainer);
    }
    return false;
  };

  /**
   * Sets the current selection and range based on the user's selection in the document.
   */
  this.setSelection = function () {
    if (this.isSelectionWithinEditor()) {
      this.selection = root.getSelection();
      this.range = document.createRange();
      try {
        this.range.setStart(
          this.selection.anchorNode,
          this.selection.anchorOffset
        );
        this.range.setEnd(this.selection.focusNode, this.selection.focusOffset);
      } catch (e) {}
    } else {
      this.selection = null;
      this.range = null;
    }
  };

  /**
   * Retrieves the inner HTML content of the editor node.
   * @returns {string} The inner HTML of the editor.
   */
  this.getText = function () {
    return wrapFirstPartWithP(process(this.node.childNodes))
  };

  this.setText = function(text){
    this.node.innerHTML = text
    html2Editor(this.node);

    const resizableImages = this.node.querySelectorAll('resizable-img')
    const latexRenderers = this.node.querySelectorAll('latex-renderer')
    resizableImages.forEach(node=>{
      node.addEventListener('resize',()=>{
        this.node.dispatchEvent(
          new Event("input", {
            bubbles: true,
            cancelable: true,
            composed: true,
          })
        );
      })
      node.addEventListener('removed',()=>{
        this.node.dispatchEvent(
          new Event("input", {
            bubbles: true,
            cancelable: true,
            composed: true,
          })
        );
      })
    })

    latexRenderers.forEach(node=>{
      node.addEventListener('removed',()=>{
        this.node.dispatchEvent(
          new Event("input", {
            bubbles: true,
            cancelable: true,
            composed: true,
          })
        );
      })
    })
  }

  /**
   * Formats the selected text with a specified inline tag (e.g., <b>, <i>, <u>).
   * @param {string} tagName - The tag name to apply to the selected text.
   */
  this.formatInline = function (tagName) {
    this.setSelection();
    if (this.hasFormat(tagName) == 0) {
      const el = document.createElement(tagName);
      el.innerHTML = this.selection.toString();

      if (this.selection.focusOffset !== this.selection.anchorOffset) {
        this.selection.deleteFromDocument();
      }

      this.range.collapse(false);
      this.range.insertNode(el);

      this.selection.removeAllRanges();
      this.selection.addRange(this.range);
    }

    for (let i = 1; i <= 3; i++) {
      if (this.hasFormat(tagName) === i) {
        let container = this.range.startContainer;
        for (let j = 0; j < i; j++) {
          container = container.parentNode;
        }
        container.parentNode.replaceChild(container.firstChild, container);
      }
    }
    this.selection = null;
    this.range = null;
    this.node.dispatchEvent(
      new Event("input", { bubbles: true, cancelable: true, composed: true })
    );
  };

  /**
   * Applies bold formatting to the selected text.
   */
  this.bold = function () {
    this.formatInline("b");
  };

  /**
   * Applies italic formatting to the selected text.
   */
  this.italic = function () {
    this.formatInline("i");
  };

  /**
   * Applies underline formatting to the selected text.
   */
  this.underline = function () {
    this.formatInline("u");
  };

  /**
   * Applies superscript formatting to the selected text.
   */
  this.super = function () {
    this.formatInline("sup");
  };

  /**
   * Applies subscript formatting to the selected text.
   */
  this.sub = function () {
    this.formatInline("sub");
  };

  /**
   * Formats the selected block-level element with a specified tag (e.g., <h1>, <p>).
   * @param {string} element - The tag name to apply to the block-level element.
   */
  this.formatBlock = function (element) {
    this.setSelection();
    try {
      const display = window.getComputedStyle(
        this.range.startContainer.parentNode
      ).display;
      if (display === "block") {
        const el = document.createElement(element);
        el.innerHTML = this.range.startContainer.parentNode.innerHTML;
        this.range.startContainer.parentNode.parentNode.replaceChild(
          el,
          this.range.startContainer.parentNode
        );
      }
    } catch (e) {}
    this.node.dispatchEvent(
      new Event("input", { bubbles: true, cancelable: true, composed: true })
    );
  };

  /**
   * Aligns the text in the selected block-level element.
   * @param {string} align - The alignment type (e.g., 'left', 'right', 'center', 'justify').
   */
  this.alignText = function (align) {
    this.setSelection();
    try {
      const display = window.getComputedStyle(
        this.range.startContainer.parentNode
      ).display;
      if (display === "block") {
        this.range.startContainer.parentNode.style.textAlign = align;
        this.range.endContainer.parentNode.style.textAlign = align;
        this.selection.removeAllRanges();
        this.selection.addRange(this.range);
      }
    } catch (e) {}
    this.node.dispatchEvent(
      new Event("input", { bubbles: true, cancelable: true, composed: true })
    );
  };

  /**
   * Checks if the current selection is wrapped in a specified tag.
   * @param {string} tag - The tag name to check for.
   * @returns {number} The level of nesting of the tag or 0 if not present.
   */
  this.hasFormat = function (tag) {
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
    } catch (e) {}
  };

  /**
   * Inserts an image at the current cursor position.
   * @param {string} url - The source URL of the image to insert.
   */
  this.insertImage = function (url) {
    this.setSelection();
    if (
      this.selection &&
      this.selection.anchorOffset === this.selection.focusOffset
    ) {
      try {
        const img = document.createElement("resizable-img");
        img.contentEditable = false;
        const space = document.createTextNode("\u2009");
        img.setAttribute("src", url);
        img.setAttribute("width", 300);
        img.setAttribute("height", 300);
        self.range.insertNode(img);
        this.range.setStartAfter(img)
        this.range.collapse(true)
        self.range.insertNode(space);
        this.node.dispatchEvent(
          new Event("input", {
            bubbles: true,
            cancelable: true,
            composed: true,
          })
        );
        img.addEventListener('removed', () => {
          this.node.dispatchEvent(
            new Event("input", {
              bubbles: true,
              cancelable: true,
              composed: true,
            })
          );
        });
        img.addEventListener('resize', ()=>{
          this.node.dispatchEvent(
            new Event("input", {
              bubbles: true,
              cancelable: true,
              composed: true,
            })
          );
        })

      } catch (e) {}
    }
  };

  /**
   * Inserts an image at the current cursor position from a file input as a base64-encoded string.
   */
  this.insertBase64Image = function () {
    // Create a hidden file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";

    // Append the file input to the document body
    document.body.appendChild(fileInput);

    // Set an event listener to handle the file selection
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64String = event.target.result;

          // Reuse the existing insertImage method to insert the image
          this.insertImage(base64String);
        };

        // Read the file as a data URL (base64 string)
        reader.readAsDataURL(file);
      }

      // Remove the file input from the DOM
      document.body.removeChild(fileInput);
    });

    // Trigger the click event to open the file dialog
    fileInput.click();
  };

  /**
   * Inserts a MathML equation into the editor using a modal dialog box with Mathlive input.
   */
  this.insertMathML = function () {
    this.setSelection()
    // Create the modal box
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "30%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.zIndex = 1000;
    modal.style.backgroundColor = "#fff";
    modal.style.border = "1px solid #ccc";
    modal.style.padding = "20px";
    modal.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
    modal.style.width = "200px";

    // Create Mathlive input element
    const mathInput = document.createElement("math-field");
    mathInput.style.width = "100%";
    mathInput.style.height = "50pt";
    mathInput.style.marginBottom = "10px";
    modal.appendChild(mathInput);

    // Create insert button
    const insertButton = document.createElement("button");
    insertButton.textContent = "Insert";
    modal.appendChild(insertButton);

    // Create cancel button
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.marginLeft = "10px";
    modal.appendChild(cancelButton);

    // Append modal to the document body
    document.body.appendChild(modal);

    // Event listener for the insert button
    insertButton.addEventListener("click", () => {
      const mathML = mathInput.getValue("latex");
      const space = document.createTextNode('\u2009');
      const mathElement = document.createElement("latex-renderer");
      if (mathML) {
        // Insert the MathML at the current cursor position

        if (
          this.selection &&
          this.selection.anchorOffset === this.selection.focusOffset
        ) {
          mathElement.setAttribute("value", mathML);
          mathElement.contentEditable = false;
          this.range.insertNode(mathElement);
          this.range.setStartAfter(mathElement)
          this.range.collapse(true)
          this.range.insertNode(space);
          this.node.dispatchEvent(
            new Event("input", {
              bubbles: true,
              cancelable: true,
              composed: true,
            })
          );
          mathElement.addEventListener('removed', ()=>{
            this.node.dispatchEvent(
              new Event("input", {
                bubbles: true,
                cancelable: true,
                composed: true,
              })
            );
          })
        }
      }
      // Remove the modal after inserting
      document.body.removeChild(modal);
      //mathElement.connectedCallback()
    });

    // Event listener for the cancel button
    cancelButton.addEventListener("click", () => {
      document.body.removeChild(modal);
    });
  };

  this.inserSymbol = function() {
    this.setSelection()
    if (
      this.selection &&
      this.selection.anchorOffset === this.selection.focusOffset
    ) {
      try {
        const symbolPicker = document.createElement("symbol-picker");
        document.body.appendChild(symbolPicker);
        symbolPicker.addEventListener("insert", (e) => {
          const symbol = symbolPicker.value;
          const node = document.createTextNode(symbol)
          this.range.insertNode(node)
          this.node.dispatchEvent(
            new Event("input", {
              bubbles: true,
              cancelable: true,
              composed: true,
            })
          );
          document.body.removeChild(symbolPicker);
        })
      } catch (e){}
    }
  }

  /**
   * Inserts a list (ordered or unordered) at the current cursor position.
   * @param {string} type - The type of list to insert ('ol' or 'ul').
   */
  this.insertList = function (type) {
    this.setSelection();
    try {
      const ol = document.createElement(type);
      const li = document.createElement("li");
      ol.appendChild(li);
      this.range.collapse(false);
      this.range.insertNode(ol);
    } catch (e) {}
  };

  /**
   * Inserts a table at the current cursor position.
   * @param {number} rows - The number of rows for the table.
   * @param {number} cols - The number of columns for the table.
   */
  this.insertTable = function (rows, cols) {
    this.setSelection();
    try {
      const table = document.createElement("table");
      table.style.float = "left";
      table.border = "1";

      for (let i = 0; i < rows; i++) {
        const row = document.createElement("tr");
        row.height = 200;
        for (let j = 0; j < cols; j++) {
          const col = document.createElement("td");
          col.width = 70;
          col.height = 30;
          row.appendChild(col);
        }
        table.appendChild(row);
      }
      this.range.collapse(true);
      this.range.insertNode(table);
    } catch (e) {}
  };
  this.init();
}

export default Editor;
