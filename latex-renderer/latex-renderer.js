import "katex/dist/katex.min.css"
import "katex/dist/contrib/mhchem.js"
import katex from "katex";
import "mathlive"

function renderLatexToString(latexString) {
  try {
    return katex.renderToString(latexString, {
      throwOnError: false, // Prevent errors from being thrown for invalid LaTeX
    });
  } catch (error) {
    console.error("Error rendering LaTeX:", error);
    return "";
  }
}

class LatexRenderer extends HTMLElement {
  constructor() {
    super();

    this.mathElement = document.createElement('math-field');
    //this.mathElement.style.display = 'none'
    this.mathElement.addEventListener('keydown', e=>{
      e.stopPropagation();
      if(e.key === 'Enter') {
        e.preventDefault();
      }
    })
    this.mathElement.addEventListener('input', ()=>{
      this.setAttribute('value', this.mathElement.getValue('latex'))
    })

    // Create container for rendering
    this.renderContainer = document.createElement("span");
    this.renderContainer.style.display = "none";
    this.renderContainer.style.position = "relative";
    this.renderContainer.contentEditable = false;
   
    this.renderContainer.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent propagation to the document
      this.renderContainer.style.display = 'none'
      this.toolbar.style.display = 'inline-block'
      this.mathElement.style.display = 'inline-block'
    });
  }

  connectedCallback() {
    this.contentEditable = false;
    this.classList.add('latex-renderer')
    this.toolbar = this.createToolbar()
    this.appendChild(this.createStyle())
    
    // Append elements when the custom element is connected to the DOM
    this.appendChild(this.renderContainer);
    this.appendChild(this.mathElement)
    this.appendChild(this.toolbar)

    // Render the LaTeX content
    this.renderLatex();
    this.mathElement.innerHTML = this.getAttribute('value')
    // Global click listener to hide button
  }

  createStyle() {
    const style = document.createElement("style");
    style.innerHTML = `
     .latex-renderer{
        position: relative;
        display: inline-block;
     }
     .latex-renderer > .tool-bar {
        display: inline-block;
        position: absolute;
        left: 0px;
        bottom: 0px;
        transform: translate(0%, 100%);
      }
      .latex-renderer > .tool-bar > button {
        appearance: none;
        border: none;
        outline: none;
        margin: 1pt;
        cursor: pointer;
      }
    `
    return style
  }

  createToolbar(){
    const toolbar = document.createElement('div')
    toolbar.className = 'tool-bar'
    this.createButtons().forEach(btn=>toolbar.appendChild(btn));
    return toolbar
  }

  createButton({label, onclick, className=''}) {
    const button = document.createElement('button')
    button.innerHTML = label
    button.className = className
    button.addEventListener('click', onclick);
    return button
  }

  createButtons() {
    const buttons = [
      {label: 'Ok', onclick: this.hideToolbar.bind(this), className: 'ok'},
      {label: 'Delete', onclick: this.delete.bind(this), className: 'delete'}
    ]
    return buttons.map(btn=>this.createButton(btn));
  }

  disconnectedCallback() {
    
  }

  static get observedAttributes() {
    return ["value"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "value" && newValue !== oldValue) {
      this.renderLatex();
    }
  }

  renderLatex() {
    const value = this.getAttribute("value") || "";
    this.renderContainer.innerHTML = ""; // Clear previous rendering
    try {
      katex.render(value, this.renderContainer, {
        throwOnError: false,
      });
    } catch (error) {
      console.error("KaTeX render error:", error);
      this.renderContainer.textContent = value; // Fallback to plain text
    }
  }

  hideToolbar() {
    this.toolbar.style.display = 'none';
    this.mathElement.style.display = 'none'
    this.renderContainer.style.display = 'inline-block'
  }

  delete(){
    this.remove();
    setTimeout(() => {
        // Dispatch the event after removal
        const removedEvent = new CustomEvent('removed', {
          bubbles: true,
          cancelable: false,
          detail: { message: 'ResizableImage has been removed' },
        });
        this.dispatchEvent(removedEvent);
      }, 0);
  }

  get string(){
    return renderLatexToString(this.getAttribute('value'))
  }
}


export default LatexRenderer;

