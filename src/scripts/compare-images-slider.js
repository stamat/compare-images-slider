import { percentage } from 'book-of-spells'

function onDrag(element, callback) {
  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;
  let dragging = false;
  let rect = element.getBoundingClientRect();

  const handleStart = function(e) {
    const carrier = e.type === 'touchstart' ? e.touches[0] : e;
    startX = carrier.clientX;
    startY = carrier.clientY;
    dragging = true;
    rect = element.getBoundingClientRect();
    const xPercentage = percentage(startX - rect.left, rect.width);
    const yPercentage = percentage(startY - rect.top, rect.height);
    const event = new CustomEvent('dragstart', { detail: { target: element, startX, startY, rect, xPercentage, yPercentage } });
    element.dispatchEvent(event);
  };

  const handleMove = function(e) {
    if (!dragging) return;
    const carrier = e.type === 'touchmove' ? e.touches[0] : e;
    endX = carrier.clientX;
    endY = carrier.clientY;
    handleDragGesture();
  };

  const handleEnd = function() {
    dragging = false;
    const event = new CustomEvent('dragend', { detail: { target: element, startX, startY, rect, endX, endY } });
    element.dispatchEvent(event);
  };

  const handleDragGesture = function() {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const left = deltaX < 0;
    const up = deltaY < 0;
    const xPercentage = percentage(endX - rect.left, rect.width);
    const yPercentage = percentage(endY - rect.top, rect.height);

    const detail = {
      target: element,
      deltaX: deltaX,
      deltaY: deltaY,
      startX: startX,
      startY: startY,
      endX: endX,
      endY: endY,
      horizontalDirection: left ? 'left' : 'right',
      verticalDirection: up ? 'up' : 'down',
      xPercentage: xPercentage,
      yPercentage: yPercentage
    };

    if (xPercentage < 0) {
      detail.xPercentage = 0;
    }

    if (xPercentage > 100) {
      detail.xPercentage = 100;
    }

    if (yPercentage < 0) {
      detail.yPercentage = 0;
    }

    if (yPercentage > 100) {
      detail.yPercentage = 100;
    }

    if (callback) {
      callback(detail);
    }

    const event = new CustomEvent('drag', { detail: detail });
    element.dispatchEvent(event);
  };

  element.addEventListener('mousedown', handleStart);
  element.addEventListener('mousemove', handleMove);
  element.addEventListener('mouseup', handleEnd);
  element.addEventListener('touchstart', handleStart);
  element.addEventListener('touchmove', handleMove);
  element.addEventListener('touchend', handleEnd);

  return {
    destroy: function() {
      element.removeEventListener('mousedown', handleStart);
      element.removeEventListener('mousemove', handleMove);
      element.removeEventListener('mouseup', handleEnd);
      element.removeEventListener('touchstart', handleStart);
      element.removeEventListener('touchmove', handleMove);
      element.removeEventListener('touchend', handleEnd);
    }
  };
}

export default class CompareImagesSlider {
  constructor(element, options) {
    this.element = element;
    this.frame = this.element.querySelector('.frame');
    this.second = this.frame.querySelector(':scope > img');
    this.handle = this.element.querySelector('.handle');

    window.addEventListener('resize', () => {
      requestAnimationFrame(this.setupSecondImage.bind(this));
    });
    this.setupSecondImage();

    this.drag = onDrag(this.element);
    this.element.addEventListener('dragstart', this.updateVisibleHandler.bind(this));
    this.element.addEventListener('drag', this.updateVisibleHandler.bind(this));
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
  }
}
