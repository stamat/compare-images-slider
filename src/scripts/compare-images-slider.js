import { drag, shallowMerge } from 'book-of-spells'

export default class CompareImagesSlider {
  constructor(element, options) {
    this.element = element;
    this.frame = this.element.querySelector('.frame');
    this.second = this.frame.querySelector(':scope > img');
    this.handle = this.element.querySelector('.handle');

    this.options = {
      inertia: false,
      bounce: false,
      friction: 0.9,
      bounceFactor: 0.1,
      onlyHandleActivation: false
    }

    if (options) shallowMerge(this.options, options);

    window.addEventListener('resize', () => {
      requestAnimationFrame(this.setupSecondImage.bind(this));
    });
    this.setupSecondImage();

    this.drag = drag(this.element, this.options);

    this.bound = false;
    this.boundUpdateVisibleHandler = this.updateVisibleHandler.bind(this);

    const addEventListeners = () => {
      if (this.bound) return;
      this.bound = true;
      this.element.addEventListener('dragstart', this.boundUpdateVisibleHandler);
      this.element.addEventListener('drag', this.boundUpdateVisibleHandler);
    };
  
    const removeEventListeners = () => {
      if (!this.bound) return;
      this.bound = false;
      this.element.removeEventListener('dragstart', this.boundUpdateVisibleHandler);
      this.element.removeEventListener('drag', this.boundUpdateVisibleHandler);
    };

    if (this.options.onlyHandleActivation) {
      this.handle.addEventListener('mousedown', addEventListeners);
      this.handle.addEventListener('touchstart', addEventListeners);
      document.addEventListener('mouseup', removeEventListeners);
      document.addEventListener('touchend', removeEventListeners);
    } else {
      this.element.addEventListener('dragstart', this.boundUpdateVisibleHandler);
      this.element.addEventListener('drag', this.boundUpdateVisibleHandler);
    }
    this.element.addEventListener('draginertia', this.boundUpdateVisibleHandler);
  }

  setupSecondImage() {
    const width = this.element.offsetWidth + 'px';
    this.second.style.width = width;
  }

  updateVisibleHandler(e) {
    this.frame.style.width = e.detail.xPercentage + '%';
    this.handle.style.left = e.detail.xPercentage + '%';
  }

  destroy() {
    this.drag.destroy();
    this.element.removeEventListener('dragstart', this.boundUpdateVisibleHandler);
    this.element.removeEventListener('drag', this.boundUpdateVisibleHandler);
    this.element.removeEventListener('draginertia', this.boundUpdateVisibleHandler);
  }
}
