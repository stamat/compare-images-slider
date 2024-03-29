import { shallowMerge, drag } from 'book-of-spells';

/**
 * @class CompareImagesSlider
 * @classdesc A class to create a compare images slider.
 * @param {HTMLElement} element - The element to create the compare images slider on.
 * @param {Object} options - The options for the compare images slider.
 * @param {Boolean} [options.inertia=false] - Whether to use inertia when dragging.
 * @param {Boolean} [options.bounce=false] - Whether to use bounce when dragging.
 * @param {Number} [options.friction=0.9] - The friction to use when dragging.
 * @param {Number} [options.bounceFactor=0.1] - The bounce factor to use when dragging.
 * @param {Boolean} [options.onlyHandle=true] - Whether to only allow dragging the handle.
 * @param {Boolean} [options.vertical=false] - Whether to make the slider vertical.
 * @todo Keyboard controls - left and right arrow keys. Or up and down arrow keys if vertical. But the handle should be focused first - meaning it should be a button or a focusable element.
 * @todo Double click the handle to go to extremes.
 * @todo Accessibility - aria attributes.
 * @todo make a custom element.
 * @todo when onlyHandle is true, cancel the update while inertia
 */
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
      onlyHandle: true,
      vertical: false
    }

    if (options) shallowMerge(this.options, options);

    this.checkAndApplyAttribute('vertical');
    if (this.options.vertical && !(this.element.dataset.vertical || this.element.hasAttribute('vertical'))) this.element.setAttribute('vertical', '');
    if (this.options.onlyHandle) this.options.preventDefaultTouch = false;

    window.addEventListener('resize', () => {
      requestAnimationFrame(this.setupSecondImage.bind(this));
    });
    this.setupSecondImage();

    this.drag = drag(this.element, this.options);

    this.handleDragBound = false;
    this.boundUpdateVisibleHandler = this.updateVisibleHandler.bind(this);

    const preventDefault = (e) => {
      if (this.handleDragBound) e.preventDefault();
    }

    const addEventListeners = () => {
      if (this.handleDragBound) return;
      this.handleDragBound = true;

      this.element.addEventListener('dragstart', this.boundUpdateVisibleHandler);
      this.element.addEventListener('drag', this.boundUpdateVisibleHandler);
      this.element.addEventListener('draginertia', this.boundUpdateVisibleHandler);
      this.element.addEventListener('draginertiaend', () => {
        this.element.removeEventListener('draginertia', this.boundUpdateVisibleHandler);
      });

      this.element.addEventListener('touchstart', preventDefault);
    };
  
    const removeEventListeners = () => {
      if (!this.handleDragBound) return;
      this.handleDragBound = false;
      this.element.removeEventListener('dragstart', this.boundUpdateVisibleHandler);
      this.element.removeEventListener('drag', this.boundUpdateVisibleHandler);
      this.element.removeEventListener('touchstart', preventDefault);
    };

    if (this.options.onlyHandle) {
      this.handle.addEventListener('mousedown', addEventListeners);
      this.handle.addEventListener('touchstart', addEventListeners);
      document.addEventListener('mouseup', removeEventListeners);
      document.addEventListener('touchend', removeEventListeners);
    } else {
      this.element.addEventListener('dragstart', this.boundUpdateVisibleHandler);
      this.element.addEventListener('drag', this.boundUpdateVisibleHandler);
      this.element.addEventListener('draginertia', this.boundUpdateVisibleHandler);
    }
  }

  checkAndApplyAttribute(attribute) {
    if (this.element.dataset[attribute] || this.element.hasAttribute(attribute)) this.options[attribute] = true;
  }

  setupSecondImage() {
    const width = this.element.offsetWidth + 'px';
    this.second.style.width = width;
  }

  updateVisibleHandler(e) {
    if (this.options.vertical) {
      this.frame.style.height = e.detail.yPercentage + '%';
      this.handle.style.top = e.detail.yPercentage + '%';
      return;
    }

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
