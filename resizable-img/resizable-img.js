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
            object-fit: fit;
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
      const showResizers = () => {
        this.resizers.forEach((resizer) => resizer.classList.add('visible'));
        this.deleteButton.classList.add('visible');
      };
    
      const hideResizers = () => {
        if (!this.isResizing) {
          this.resizers.forEach((resizer) => resizer.classList.remove('visible'));
          this.deleteButton.classList.remove('visible');
        }
      };
    
      const toggleResizers = (e) => {
        e.stopPropagation(); // Prevent the event from bubbling up to the document
        if (this.deleteButton.classList.contains('visible')) {
          hideResizers();
        } else {
          showResizers();
        }
      };
    
      this.image.addEventListener('click', toggleResizers);
      this.image.addEventListener('touchstart', toggleResizers, { passive: true });
    
      document.addEventListener('click', (e) => {
        if (!this.contains(e.target)) hideResizers();
      });
    
      document.addEventListener('touchstart', (e) => {
        if (!this.contains(e.target)) hideResizers();
      }, { passive: true });
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
        startWidth = parseFloat(this.image.offsetWidth);
        startHeight = parseFloat(this.image.offsetHeight);
    
        const resize = (e) => {
          const isTouchMove = e.type.startsWith('touch');
          const moveEvent = isTouchMove ? e.touches[0] : e;
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;
    
          let newWidth = startWidth;
          let newHeight = startHeight;
    
          if (resizer.classList.contains('se')) {
            newWidth = startWidth + dx;
            newHeight = startHeight + dy;
          } else if (resizer.classList.contains('sw')) {
            newWidth = startWidth - dx;
            newHeight = startHeight + dy;
          } else if (resizer.classList.contains('ne')) {
            newWidth = startWidth + dx;
            newHeight = startHeight - dy;
          } else if (resizer.classList.contains('nw')) {
            newWidth = startWidth - dx;
            newHeight = startHeight - dy;
          }
    
          // Apply constraints to ensure valid dimensions
          newWidth = Math.max(20, newWidth); // Minimum width
          newHeight = Math.max(20, newHeight); // Minimum height
    
          // Update the image dimensions
          this.image.style.width = `${newWidth}px`;
          this.image.style.height = `${newHeight}px`;
    
          // Update the container dimensions to match the image
          this.container.style.width = `${newWidth}px`;
          this.container.style.height = `${newHeight}px`;
    
          // Update the custom element's attributes
          this.setAttribute('width', Math.round(newWidth));
          this.setAttribute('height', Math.round(newHeight));
          this.dispatchEvent(new Event('resize', {cancelable: true, composed: true, bubbles: true}))
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
        this.remove(); // Removes the element from the DOM
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
    }
    
  }
  
  export default ResizableImage;
