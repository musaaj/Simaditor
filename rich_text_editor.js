import Editor from "./editor";
import FormulaIcon from "./icons/math.svg"
import BoldIcon from "./icons/bold.svg"
import ItalicsIcon from "./icons/italics.svg"
import UndelineIcon from "./icons/underline.svg"
import SuperIcon from "./icons/super.svg"
import SubIcon from "./icons/sub.svg"
import InsertIcon from "./icons/omega.svg"
import ImageIcon from "./icons/image.svg"

class RichTextEditor extends HTMLElement {
  constructor(){
    super()
  }

  connectedCallback(){
    const value = this.getAttribute('value') || '<p><br></p>';
    this.innerHTML = '';
    this.createEditor();
    this.syncProperties()
    this.editor.setText(value)
    this.editorPane.focus();
    this.editor.addChangeListener(this._emitInputEvent.bind(this))
    this.addEventListener('keydown', e => {
      if (e.altKey) {
        e.preventDefault()
        switch(e.key) {
          case '=':
            this.editor.insertMathML()
            return false;
          case 'i':
            this.editor.insertBase64Image()
            return false;
        }
      }
      if (e.ctrlKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault()
            this.editor.bold()
            return false;
          case 'i':
            e.preventDefault()
            this.editor.italic()
            return false;
          case 'u':
            e.preventDefault()
            this.editor.underline();
            return false;
        }
      }
    })
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'value') {
      //this.editor.setText(newValue)
    } else if(this.editorPane && this.editorPane[name] !== newValue) {
      this[name] = newValue? newValue : '';
    }
  }

 
  createStyle(){
    const style = document.createElement('style');
    style.textContent = `
    .rich-container {
      border: 1px solid #eee;
      border-radius: 4pt;
      min-height: 80pt;
      box-shadow: 3px 2px 10px -7px rgba(0,0,0,0.1);
    }
    .rich-container > .toolbar, .rich-container > .editor-area{
      width: 100%;
    }
    .rich-container > .editor-area {
      height: inherit;
      outline: none;
      border: none;
      padding: 8pt;
    }
    .rich-container > .editor-area > p {
        font-family: serif;
        font-size: 1.125rem;
        line-height: 1.6;
        color: #333;
        margin: 1em 0;
        text-align: left;
        letter-spacing: 0.1em;
        word-spacing: 0.1em;
    }
    .rich-container > .editor-area > p:fist-child {
      background-color: red;
      margin-top: 0pt;
      font-size:2pt;
    }
    .rich-container > .editor-area img{
      display: inline-block;
    }
    .rich-container > .toolbar {
      display: flex;
      border-bottom: 1px solid #efefef;
      background-color: #fefefe;
    }
    .rich-container > .toolbar > button {
      appearance: none;
      outline: none;
      border: none;
      padding: 2pt 4pt 2pt 4pt;
      cursor: pointer;
      background-color: white;
    }
    .rich-container > .toolbar > button:hover {
      background-color: #f8f8f8;
    }
    @media(max-width: 768px){
      .rich-container > .editor-area > p {
        font-size: 1em;
      }
    }
    `
    return style;
  }
  
  createToolbar(){
    const createBtn = ({label, action})=>{
      const btn =  document.createElement('button');
      btn.innerHTML = `<i><img src="${label}" ></i>`;
      btn.addEventListener('click', action);
      return btn
    }

    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar'
    const btns = [
      {label: BoldIcon, action: ()=>this.editor.bold()},
      {label: ItalicsIcon, action: ()=>this.editor.italic()},
      {label: UndelineIcon, action: ()=>this.editor.underline()},
      {label: SuperIcon, action: ()=>this.editor.super()},
      {label: SubIcon, action: ()=>this.editor.sub()},
      {label: ImageIcon, action: ()=>this.editor.insertBase64Image()},
      {label: FormulaIcon, action: ()=>this.editor.insertMathML()},
      {label: InsertIcon, action: ()=>this.editor.insertSymbol()},
    ]
    for(const btn of btns){
      toolbar.appendChild(createBtn(btn));
    }
    return toolbar;
  }

  createEditor() {
    this.appendChild(this.createStyle())
    this.editorContainer = document.createElement('div')
    this.editorContainer.className = 'rich-container'
    this.editorPane = document.createElement('div');
    this.editorPane.className = 'editor-area'
    this.editor = new Editor(this.editorPane, this.shadowRoot);
    this.editorContainer.appendChild(this.createToolbar())
    this.editorContainer.appendChild(this.editorPane)
    this.appendChild(this.editorContainer)
  }

  _emitInputEvent(e){
    const event = new Event('input', {
      bubbles: true,
      cancelable: true,
      composed: true
    })

    this.setAttribute('value', this.editor.getText())
    this.dispatchEvent(event)
  }

  _emitChangeEvent(e){
    const event = new Event('change', {
      bubbles: true,
      cancelable: true,
      composed: true
    })

    this.setAttribute('value', this.editor.getText())
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

  set value(val){
    this.setAttribute('value', val || '<p><br></p>')
    this.editor? this.editor.setText(val  || '<p><br></p>') : ''
  }

  get value(){
    return this.editor? this.editor.getText() : '<p></p>'
  }

}

export default RichTextEditor;
