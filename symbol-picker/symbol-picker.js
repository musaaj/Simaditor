import { symbols } from "./symbols";

class SymbolPicker extends HTMLElement {
  constructor() {
    super();

    // Initializing class properties
    this.symbols = symbols;
  }

  connectedCallback() {
    // Create a modal overlay
    this.modalOverlay = document.createElement("div");
    this.modalOverlay.style.zIndex = 10000;
    this.modalOverlay.style.position = "fixed";
    this.modalOverlay.style.top = "0";
    this.modalOverlay.style.left = "0";
    this.modalOverlay.style.width = "100%";
    this.modalOverlay.style.height = "100%";
    this.modalOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    this.modalOverlay.style.display = "none";
    this.modalOverlay.style.alignItems = "center";
    this.modalOverlay.style.justifyContent = "center";

    // Create modal container
    this.modalContainer = document.createElement("div");
    this.modalContainer.style.backgroundColor = "#fff";
    this.modalContainer.style.padding = "16px";
    this.modalContainer.style.borderRadius = "8px";
    this.modalContainer.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.01)";
    this.modalContainer.style.width = "50%";
    this.modalContainer.style.maxWidth = "500px";
    this.modalContainer.style.display = "flex";
    this.modalContainer.style.flexDirection = "column";
    this.modalContainer.style.alignItems = "center";
    this.modalContainer.style.overflowY = "auto";

    this.controlContainer = document.createElement("div")
    this.controlContainer.style.display = 'flex'
    this.controlContainer.style.alignItems = "center";
    this.controlContainer.style.justifyContent = "center"
    this.controlContainer.style.marginTop = "8pt"
    this.controlContainer.style.gap = "20pt"

     // Create a close button for the modal
     this.insertButton = document.createElement("button");
     this.insertButton.textContent = "Insert";
     this.insertButton.style.marginBottom = "10px";
     this.insertButton.style.padding = "8px 16px";
     //this.insertButton.style.backgroundColor = "red"
     this.insertButton.style.border = "none";
     //this.insertButton.style.color = "#fff";
     this.insertButton.style.borderRadius = "4px";
     this.insertButton.style.cursor = "pointer";
     this.controlContainer.appendChild(this.insertButton)

    // Create a close button for the modal
    this.closeButton = document.createElement("button");
    this.closeButton.textContent = "Close";
    this.closeButton.style.marginBottom = "10px";
    this.closeButton.style.padding = "8px 16px";
    this.closeButton.style.border = "none";
    //this.closeButton.style.color = "#fff";
    this.closeButton.style.borderRadius = "4px";
    this.closeButton.style.cursor = "pointer";
    this.controlContainer.appendChild(this.closeButton)

    // Create a select element for categories
    this.select = document.createElement("select");
    this.select.style.marginBottom = "4pt";

    // Create a container for displaying symbols
    this.symbolContainer = document.createElement("div");
    this.symbolContainer.style.width = '100%'
    this.symbolContainer.style.display = "grid";
    this.symbolContainer.style.gridTemplateColumns = "repeat(auto-fit, minmax(20px, 1fr))";
    this.symbolContainer.style.gap = "2px";
    this.symbolContainer.style.cursor = "pointer";

    // Append modal elements
    this.modalContainer.appendChild(this.select);
    this.modalContainer.appendChild(this.symbolContainer);
    this.modalContainer.appendChild(this.controlContainer);
    this.modalOverlay.appendChild(this.modalContainer);

    document.body.appendChild(this.modalOverlay);


    // Populate the select element with categories
    this.populateCategories();

    // Add event listener for category change
    this.select.addEventListener("change", () => this.displaySymbols());

    // Add event listener for close button
    this.closeButton.addEventListener("click", () => this.closeModal());
    this.insertButton.addEventListener("click", ()=>{
      this.dispatchEvent(new Event("insert", {bubbles: true, cancelable: true}));
      this.closeModal()
    })

    // Default to the first category
    this.select.value = Object.keys(this.symbols)[0];
    this.displaySymbols();
    this.openModal();
  }

  // Populate the select element with categories
  populateCategories() {
    for (const category of Object.keys(this.symbols)) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      this.select.appendChild(option);
    }
  }

  // Display symbols for the selected category
  displaySymbols() {
    this.symbolContainer.innerHTML = ""; // Clear previous symbols
    const category = this.select.value;

    for (const symbol of this.symbols[category]) {
      const symbolElement = document.createElement("div");
      symbolElement.textContent = symbol;
      symbolElement.style.textAlign = "center";
      symbolElement.style.padding = "2px";
      symbolElement.style.border = "1px solid #ccc";
      symbolElement.style.borderRadius = "2px";
      symbolElement.style.userSelect = "none";
      symbolElement.style.fontSize = "14px";
      symbolElement.style.cursor = "pointer";
      symbolElement.style.transition = "background-color 0.2s";

      // Highlight symbol on click
      symbolElement.addEventListener("click", () => {
        const previouslySelected = this.symbolContainer.querySelector(".selected");
        if (previouslySelected) {
          previouslySelected.classList.remove("selected");
          previouslySelected.style.backgroundColor = "";
          previouslySelected.style.color = "#000";
        }
        symbolElement.classList.add("selected");
        symbolElement.style.backgroundColor = "#007BFF";
        symbolElement.style.color = "#fff";

        this.setAttribute("value", symbol); // Set the value attribute
      });

      this.symbolContainer.appendChild(symbolElement);
    }
  }

  // Get the value of the selected symbol
  get value() {
    return this.getAttribute("value") || "";
  }

  // Open the modal
  openModal() {
    this.modalOverlay.style.display = "flex";
  }

  // Close the modal
  closeModal() {
    this.modalOverlay.style.display = "none";
  }
}

export default SymbolPicker;
