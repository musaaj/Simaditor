import "@flaticon/flaticon-uicons/css/all/all.css"
import Editor from "./editor";

class RichTextEditor extends HTMLElement {
  constructor(){
    super()
  }

  connectedCallback(){
    const html = this.innerHTML + '&nbsp;';
    const value = this.value + '&nbsp;'
    this.innerHTML = '';
    this.createEditor();
    this.syncProperties()
    this.editorPane.innerHTML = value? value : html; 
    this.editorPane.addEventListener('input', this._emitInputEvent.bind(this))
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.editorPane && this.editorPane[name] !== newValue) {
      this.editorPane[name] = newValue === null ? '' : newValue;
    }
  }

 
  createStyle(){
    const style = document.createElement('style');
    style.textContent = `
    .container {
      border: 1px solid #bbb;
      border-radius: 4pt;
      min-height: 80pt;
    }
    .container > .toolbar, .container > .editor-area{
      width: 100%;
    }
    .container > .editor-area {
      height: inherit;
      outline: none;
      border: none;
      padding: 8pt;
    }
    .container > .toolbar {
      display: flex;
      border-bottom: 1px solid #999;
    }
    .container > .toolbar > button {
      appearance: none;
      outline: none;
      border: none;
      background-color: white;
      font-size: 18pt;
    }
    `
    return style;
  }
  
  createToolbar(){
    const createBtn = ({label, action})=>{
      const btn =  document.createElement('button');
      btn.innerHTML = `<i class="fi ${label}"></i>`;
      btn.style.fontSize = "12pt"
      btn.style.cursor = "pointer"
      btn.style.padding = "2pt 4pt 2pt 4pt"
      btn.style.border = "1pt solid #efefef"
      btn.addEventListener('click', action);
      return btn
    }

    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar'
    const btns = [
      {label: 'fi-ss-bold', action: ()=>this.editor.bold()},
      {label: 'fi-ss-italic', action: ()=>this.editor.italic()},
      {label: 'fi-ss-underline', action: ()=>this.editor.underline()},
      {label: 'fi-ss-superscript', action: ()=>this.editor.super()},
      {label: 'fi-ss-subscript', action: ()=>this.editor.sub()},
      {label: 'fi-ss-picture', action: ()=>this.editor.insertBase64Image()},
      {label: 'fi-ss-function', action: ()=>this.editor.insertMathML()},
      {label: 'fi-ss-omega', action: ()=>this.editor.inserSymbol()},
    ]
    for(const btn of btns){
      toolbar.appendChild(createBtn(btn));
    }
    return toolbar;
  }

  createEditor() {
    this.appendChild(this.createStyle())
    this.editorContainer = document.createElement('div')
    this.editorContainer.className = 'container'
    this.editorPane = document.createElement('div');
    this.editorPane.className = 'editor-area'
    this.editor = new Editor(this.editorPane, this.shadowRoot);
    this.editorContainer.appendChild(this.createToolbar())
    this.editorContainer.appendChild(this.editorPane)
    this.appendChild(this.editorContainer)
  }

  _emitInputEvent(){
    const event = new Event('input', {
      bubbles: true,
      cancelable: true,
      composed: true
    })

    this.setAttribute('value', this.editorPane.innerHTML)
    this.dispatchEvent(event)
  }

  syncProperties() {
    for (const attr of RichTextEditor.observedAttributes) {
      if (this.hasAttribute(attr)) {
        this.editorPane[attr] = this.getAttribute(attr);
      }
    }
  }

  static get observedAttributes() {
    return ['value', 'innerHTML', 'name'];
  }

  set innerHTML(val){
    this.value = val
    this.editorPane? this.editorPane.innerHTML = val : null
  }
  get innerHTML(){
    return this.editorPane? this.editorPane.innerHTML : null
  }

  set value(val){
    this.setAttribute('value', val)
    this.editorPane? this.editorPane.innerHTML = val : null
  }
  get value(){
    return this.editorPane? this.editorPane.innerHTML  : null
  }

}

export default RichTextEditor;
