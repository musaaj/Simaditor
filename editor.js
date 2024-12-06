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

function wrapFirstPartWithP(htmlString) {
  const firstPIndex = htmlString.indexOf("<p>");
  const endIndex = firstPIndex === -1 ? htmlString.length : firstPIndex;

  const wrappedString =
    "<p>" + htmlString.slice(0, endIndex) + "</p>" + htmlString.slice(endIndex);

  return wrappedString;
}

function copyChildNodes(sourceElement, destinationElement) {
  if (
    !(sourceElement instanceof HTMLElement) ||
    !(destinationElement instanceof HTMLElement)
  ) {
    throw new Error(
      "Both sourceElement and destinationElement must be valid HTML elements."
    );
  }

  // Clone each child node from the source element
  sourceElement.childNodes.forEach((node) => {
    // Append a deep clone of the node to the destination element
    destinationElement.appendChild(node.cloneNode(true));
  });
}

function Editor(node, shadow = null) {
  this.selection = null;
  this.range = null;
  this.node = node;
  const root = shadow || document;

  /**
   * Initializes the editor by setting the contentEditable property and adding default content.
   */
  this.init = function () {
    this.node.contentEditable = true;
    this.node.addEventListener("input", () => {
      if (this.node.firstChild && this.node.firstChild.tagName != "P") {
        const textNode = this.node.firstChild;
        const paragraph = document.createElement("p");
        this.node.replaceChild(paragraph, textNode);
        paragraph.appendChild(textNode);
      } else if (!this.node.firstChild) {
        const textNode = document.createTextNode('\u2009')
        const paragraph = document.createElement("p");
        this.node.appendChild(paragraph)
        paragraph.appendChild(textNode);
      }
    });
    this.node.addEventListener("focus", () => {
      if (this.node.firstChild &&this.node.firstChild.tagName != "P") {
        const textNode = this.node.firstChild;
        const paragraph = document.createElement("p");
        this.node.replaceChild(paragraph, textNode);
        paragraph.appendChild(textNode);
        this.setSelection();
        this.range = new Range();
        this.range.setStart(paragraph, 1);
        this.range.setEnd(paragraph, 1);
        this.selection.removeAllRanges();
        this.selection.addRange(this.range);
        this.range.collapse(true);
      }else if (!this.node.firstChild) {
        const textNode = document.createTextNode('\u2009')
        const paragraph = document.createElement("p");
        this.node.appendChild(paragraph)
        paragraph.appendChild(textNode);
      }
    });
    this.node.addEventListener("keydown", (e) => {
      //console.log(e.key)
      if (e.key == "Enter") {
        e.preventDefault();

        this.selection = window.getSelection();
        this.range = this.selection.getRangeAt(0);

        const startContainer =
          this.range.startContainer.nodeType === Node.TEXT_NODE
            ? this.range.startContainer.parentElement
            : this.range.startContainer;

        const parentParagraph = startContainer.closest("p");

        if (parentParagraph) {
          const splitRange = this.range.cloneRange();
          splitRange.setEndAfter(parentParagraph);
          const afterContent = splitRange.extractContents(); // Get the content after the cursor

          // Create a new paragraph for the after content
          const newParagraph = document.createElement("p");
          if (afterContent.firstChild.textContent) {
            console.log(afterContent.firstChild.innerHTML)
            copyChildNodes(afterContent.firstChild, newParagraph);
          } else {
            newParagraph.appendChild(document.createElement('br'));
          }

          // Insert the new paragraph after the current one
          parentParagraph.after(newParagraph);

          const deleteRange = this.range.cloneRange();
          deleteRange.setStart(this.range.endContainer, this.range.endOffset);
          deleteRange.setEndAfter(parentParagraph);
          deleteRange.deleteContents();

          // Move the cursor to the new paragraph
          const newRange = document.createRange();
          newRange.selectNodeContents(newParagraph);
          newRange.setStart(newParagraph, 1)
          newRange.setEnd(newParagraph, 1)
          this.selection.removeAllRanges();
          this.selection.addRange(newRange);
        } else {
          // If not inside a paragraph, insert the new paragraph at the current position
          const newParagraph = document.createElement("p");
          console.log(newParagraph)
          newParagraph.innerHTML = "<br>";
          this.range.insertNode(newParagraph);
          const newRange = document.createRange();
          newRange.selectNodeContents(newParagraph);
          this.range.setStartAfter(newParagraph, 0);
          this.range.setEndAfter(newParagraph, 0);
          newRange.collapse(false); // Set cursor at the start of the paragraph
          this.selection.removeAllRanges();
          this.selection.addRange(newRange);
        }
        this.node.dispatchEvent(
          new Event("input", {
            bubbles: true,
            cancelable: true,
            composed: true,
          })
        );
      }
      if (e.key === "Backspace") {
        const childs = Array.from(this.node.childNodes)
        if(childs.length == 1) {
          if(childs[0].tagName === "P") {
            if (!childs[0].innerText.trim()) {
              e.preventDefault()
            }
          }
        }
      }
    });
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
    return process(this.node.childNodes);
  };

  this.setText = function (text) {
    this.node.innerHTML = text || "<p><br></p>";

    html2Editor(this.node);

    const resizableImages = this.node.querySelectorAll("resizable-img");
    const latexRenderers = this.node.querySelectorAll("latex-renderer");
    resizableImages.forEach((node) => {
      node.addEventListener("resize", () => {
        this.node.dispatchEvent(
          new Event("input", {
            bubbles: true,
            cancelable: true,
            composed: true,
          })
        );
      });
      node.addEventListener("removed", () => {
        this.node.dispatchEvent(
          new Event("input", {
            bubbles: true,
            cancelable: true,
            composed: true,
          })
        );
      });
    });

    latexRenderers.forEach((node) => {
      node.addEventListener("removed", () => {
        this.node.dispatchEvent(
          new Event("input", {
            bubbles: true,
            cancelable: true,
            composed: true,
          })
        );
      });
    });
  };

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
    //this.selection = null;
    //this.range = null;
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
        this.range.insertNode(img);
        this.range.setStartAfter(img);
        this.range.collapse(true);
        this.range.insertNode(space);
        this.node.dispatchEvent(
          new Event("input", {
            bubbles: true,
            cancelable: true,
            composed: true,
          })
        );
        img.addEventListener("removed", () => {
          this.node.dispatchEvent(
            new Event("input", {
              bubbles: true,
              cancelable: true,
              composed: true,
            })
          );
        });
        img.addEventListener("resize", () => {
          this.node.dispatchEvent(
            new Event("input", {
              bubbles: true,
              cancelable: true,
              composed: true,
            })
          );
        });
      } catch (e) {
        console.log(e)
      }
    } else {
      console.log('no')
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
    this.setSelection();

    const space = document.createTextNode("\u2009");
    const mathElement = document.createElement("latex-renderer");
      if (
        this.selection &&
        this.selection.anchorOffset === this.selection.focusOffset
      ) {
        this.range.insertNode(mathElement);
        this.range.setStartAfter(mathElement);
        this.range.collapse(true);
        this.range.insertNode(space);
        mathElement.focus();
        this.node.dispatchEvent(
          new Event("input", {
            bubbles: true,
            cancelable: true,
            composed: true,
          })
        );
        mathElement.addEventListener("removed", () => {
          this.node.dispatchEvent(
            new Event("input", {
              bubbles: true,
              cancelable: true,
              composed: true,
            })
          );
        });
      }
  return
  };

  this.inserSymbol = function () {
    this.setSelection();
    if (
      this.selection &&
      this.selection.anchorOffset === this.selection.focusOffset
    ) {
      try {
        const symbolPicker = document.createElement("symbol-picker");
        document.body.appendChild(symbolPicker);
        symbolPicker.addEventListener("insert", (e) => {
          const symbol = symbolPicker.value;
          const node = document.createTextNode(symbol);
          this.range.insertNode(node);
          this.node.dispatchEvent(
            new Event("input", {
              bubbles: true,
              cancelable: true,
              composed: true,
            })
          );
          document.body.removeChild(symbolPicker);
        });
      } catch (e) {}
    }
  };

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
