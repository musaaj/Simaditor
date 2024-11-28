import "@fortawesome/fontawesome-free/css/all.min.css";
import Editor from "./editor";

class RichTextEditor extends HTMLElement {
  constructor() {
    super();
    this.createEditor();
  }

  connectedCallback() {
    alert(this);
  }

  createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';
    const btns = `
      <button><i class="fas fa-bold"></i></button>
      <button><i class="fas fa-italic"></i></button>
      <button><i class="fas fa-underline"></i></button>
      <button><i class="fas fa-superscript"></i></button>
      <button><i class="fas fa-subscript"></i></button>
      <button><i class="fas fa-image"></i></button>
      <button><i class="fas fa-plus"></i></button>
    `;
    toolbar.innerHTML = btns;
    return toolbar;
  }

  createEditor() {
    this.editorContainer = document.createElement('div');
    this.editorPane = document.createElement('div');
    this.editorPane.className = 'editor-pane';
    this.editor = new Editor(this.editorPane);

    // Append toolbar and editor pane to the container
    this.editorContainer.appendChild(this.createToolbar());
    this.editorContainer.appendChild(this.editorPane);

    // Create and use the shadow DOM
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(this.editorContainer);
  }
}

// Register the custom element
customElements.define('rich-textarea', RichTextEditor);

export default RichTextEditor;

