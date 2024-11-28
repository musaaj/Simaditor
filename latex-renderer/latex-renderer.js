import "katex/dist/katex.min.css"
import "katex/dist/contrib/mhchem.js"
import katex from "katex";

class LatexRenderer extends HTMLElement {
  constructor() {
    super();
    // Create button
    this.button = document.createElement("button");
    this.button.innerHTML = "&times;"; // "X" icon
    this.button.style.display = "none";
    this.button.style.position = "absolute";
    this.button.style.transform = "translateX(-80%)";
    this.button.style.marginTop = "5px";
    this.button.style.padding = "5px";
    this.button.style.border = "none";
    this.button.style.borderRadius = "50%";
    this.button.style.backgroundColor = "#ff4d4d";
    this.button.style.color = "white";
    this.button.style.cursor = "pointer";
    this.button.style.fontSize = "14px";
    this.button.addEventListener("click", (e) => {
      //e.stopPropagation(); // Prevent propagation to the document
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
    });

    // Create container for rendering
    this.renderContainer = document.createElement("span");
    this.renderContainer.style.display = "inline-block";
    this.renderContainer.style.position = "relative";
    this.renderContainer.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent propagation to the document
      this.button.style.display = "inline";
    });
  }

  connectedCallback() {
    // Append elements when the custom element is connected to the DOM
    this.appendChild(this.renderContainer);
    this.renderContainer.appendChild(this.button);

    // Render the LaTeX content
    this.renderLatex();

    // Global click listener to hide button
    this.hideButtonOutside = this.hideButtonOutside.bind(this);
    document.addEventListener("click", this.hideButtonOutside);
  }

  disconnectedCallback() {
    // Clean up the global event listener
    document.removeEventListener("click", this.hideButtonOutside);
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
    // Re-add the button after KaTeX rendering
    this.renderContainer.appendChild(this.button);
    this.button.style.display = "none"; // Hide button initially
  }

  hideButtonOutside(event) {
    if (!this.contains(event.target)) {
      this.button.style.display = "none";
    }
  }
}


export default LatexRenderer;

