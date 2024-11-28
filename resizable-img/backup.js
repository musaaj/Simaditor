import "@fortawesome/fontawesome-free/css/all.min.css";

class ResizableImage extends HTMLElement {
    static get observedAttributes() {
      return ['width', 'height', 'src', 'alt'];
    }
  
    constructor() {
      super();
      this.image = this.querySelector('img');

      this.container = document.createElement('div')
      this.container.className = 'containers';

      this.image = document.createElement('img');
      this.container.appendChild(this.image);

      this.resizers1 = document.createElement('div')
      this.resizers1.className = 'resizer nw';
      this.container.appendChild(this.resizers1);


      this.resizers2 = document.createElement('div');
      this.resizers2.className = 'resizer ne'
      this.container.appendChild(this.resizers2);


      this.resizers3 = document.createElement('div');
      this.resizers3.className = 'resizer sw'
      this.container.appendChild(this.resizers3);

      this.resizers4 = document.createElement('div');
      this.resizers4.className = 'resizer se'
      this.container.appendChild(this.resizers4);

      this.deleteButton = document.createElement('button');
      this.deleteButton.innerHTML = '×';
      this.deleteButton.className = 'delete-button';
      this.container.appendChild(this.deleteButton);

      this.resizers = this.container.querySelectorAll('.resizer')
      this.isResizing = false;
      
    }
  
    connectedCallback() {
	this.innerHTML = `
        <style>
          .containers {
            position: relative;
            display: inline-block;
            width: 100%;
            height: 100%;
            border: 1px solid transparent;
          }
          img {
            display: inline-block;
            width: 100%;
            height: 100%;
            object-fit: contain;
            cursor: pointer;
          }
          .resizer {
            position: absolute;
            width: 20px; /* Larger size for better touch handling */
            height: 20px;
            background: white;
            border: 2px solid #6e01ad;
            box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            display: none; /* Initially hidden */
            border-radius: 50%; /* Rounded resizers */
          }
          .resizer.ne { top: -10px; right: -10px; cursor: nesw-resize; }
          .resizer.nw { top: -10px; left: -10px; cursor: nwse-resize; }
          .resizer.se { bottom: -10px; right: -10px; cursor: nwse-resize; }
          .resizer.sw { bottom: -10px; left: -10px; cursor: nesw-resize; }
          .resizer.visible { display: block; }
  
          .delete-button {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px; /* Larger for touch */
            height: 40px;
            background: red;
            color: white;
            border: none;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            font-size: 20px;
            font-weight: bold;
            display: none; 
            justify-content: center;
            align-items: center;
          }
  
          .delete-button.visible {
            display: flex;
          }
  
          .container:hover .delete-button,
          .container:hover .resizer {
            display: flex; /* Show delete button and resizers on hover */
          }
        </style>`;
      this.style.display = 'inline'
      this.style.position = 'relative'
      this.appendChild(this.container);
      this.initToggleResizers();
      this.initResize();
      this.initDeleteButton();
      this.updateImageSize();
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'width' || name === 'height') {
        this.updateImageSize();
      } else if (name === 'src') {
        this.image.setAttribute('src', newValue)
      } else if (name === 'alt') {
        this.image.setAttribute('alt', newValue)
      } else {
        this[name] = newValue;
      }
    }
  
    updateImageSize() {
      const width = this.getAttribute('width');
      const height = this.getAttribute('height');
      if (width) {
        this.style.width = `${width}px`;
        this.container.style.width = `${width}px`;
        this.image.style.width = '100%'
    }
      if (height) {
        this.style.height = `${height}px`
        this.container.style.height = `${height}px`;
        this.image.style.height = '100%'
      }
    }
  
    initToggleResizers() {
      const toggleResizers = (e) => {
        if (this.isResizing) return;
  
        const anyResizerVisible = [...this.resizers].some((resizer) =>
          resizer.classList.contains('visible')
        );
  
        if (anyResizerVisible) {
          this.resizers.forEach((resizer) => resizer.classList.remove('visible'));
          this.deleteButton.classList.remove('visible');
        } else {
          this.resizers.forEach((resizer) => resizer.classList.add('visible'));
          this.deleteButton.classList.add('visible');
        }
      };
  
      const hideResizers = () => {
        if (!this.isResizing) {
          this.resizers.forEach((resizer) => resizer.classList.remove('visible'));
          this.deleteButton.classList.remove('visible');
        }
      };
  
      this.image.addEventListener('click', toggleResizers);
      this.image.addEventListener('touchstart', toggleResizers, { passive: true });
  
      document.addEventListener('click', (e) => {
        if (!this.contains(e.target)) hideResizers();
      });
    }
  
    initResize() {
      let startX, startY, startWidth, startHeight;
  
      const startResize = (e, resizer) => {
        e.preventDefault();
        this.isResizing = true;
  
        const isTouch = e.type.startsWith('touch');
        const event = isTouch ? e.touches[0] : e;
        startX = event.clientX;
        startY = event.clientY;
        startWidth = parseFloat(this.container.style.width || this.image.offsetWidth);
        startHeight = parseFloat(this.container.style.height || this.image.offsetHeight);
  
        const resize = (e) => {
          const isTouchMove = e.type.startsWith('touch');
          const moveEvent = isTouchMove ? e.touches[0] : e;
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;
  
          if (resizer.classList.contains('se')) {
            this.image.style.width = `${startWidth + dx}px`;
            this.image.style.height = `${startHeight + dy}px`

            this.container.style.width = `${startWidth + dx}px`;
            this.container.style.height = `${startHeight + dy}px`;

            this.style.width = `${startWidth + dx}px`;
            this.style.height = `${startHeight + dy}px`;


          } else if (resizer.classList.contains('sw')) {
            this.image.style.width = `${startWidth - dx}px`;
            this.image.style.height = `${startHeight + dy}px`

            this.container.style.width = `${startWidth - dx}px`;
            this.container.style.height = `${startHeight + dy}px`;

            this.style.width = `${startWidth - dx}px`;
            this.style.height = `${startHeight + dy}px`;

          } else if (resizer.classList.contains('ne')) {
            this.image.style.width = `${startWidth + dx}px`;
            this.image.style.height = `${startHeight - dy}px`

            this.container.style.width = `${startWidth + dx}px`;
            this.container.style.height = `${startHeight - dy}px`;

            this.style.width = `${startWidth + dx}px`;
            this.style.height = `${startHeight - dy}px`;

          } else if (resizer.classList.contains('nw')) {
            this.image.style.width = `${startWidth - dx}px`;
            this.image.style.height = `${startHeight - dy}px`

            this.container.style.width = `${startWidth - dx}px`;
            this.container.style.height = `${startHeight - dy}px`;

            this.style.width = `${startWidth - dx}px`;
            this.style.height = `${startHeight - dy}px`;
          }
  
          
          this.setAttribute('width', parseInt(this.container.style.width));
          this.setAttribute('height', parseInt(this.container.style.height));
        };
  
        const stopResize = () => {
          this.isResizing = false;
          window.removeEventListener('mousemove', resize);
          window.removeEventListener('touchmove', resize);
          window.removeEventListener('mouseup', stopResize);
          window.removeEventListener('touchend', stopResize);
        };
  
        window.addEventListener('mousemove', resize);
        window.addEventListener('touchmove', resize);
        window.addEventListener('mouseup', stopResize);
        window.addEventListener('touchend', stopResize);
      };
  
      this.resizers.forEach((resizer) => {
        resizer.addEventListener('mousedown', (e) => startResize(e, resizer));
        resizer.addEventListener('touchstart', (e) => startResize(e, resizer), { passive: false });
      });
    }
  
    initDeleteButton() {
      this.deleteButton.addEventListener('click', () => {
        this.remove();
        this.dispatchEvent(new Event({type: 'removed', cancelable: true, bubbles: true}))
      });
    }
  }
  
  export default ResizableImage;
