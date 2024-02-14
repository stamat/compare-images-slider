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
    }

    if (options) shallowMerge(this.options, options);

    window.addEventListener('resize', () => {
      requestAnimationFrame(this.setupSecondImage.bind(this));
    });
    this.setupSecondImage();

    this.drag = drag(this.element, this.options);
    this.element.addEventListener('dragstart', this.updateVisibleHandler.bind(this));
    this.element.addEventListener('drag', this.updateVisibleHandler.bind(this));
    this.element.addEventListener('draginertia', this.updateVisibleHandler.bind(this));
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
    this.element.removeEventListener('dragstart', this.updateVisibleHandler.bind(this));
    this.element.removeEventListener('drag', this.updateVisibleHandler.bind(this));
    this.element.removeEventListener('draginertia', this.updateVisibleHandler.bind(this));
  }
}
