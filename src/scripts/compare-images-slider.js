import { percentage } from 'book-of-spells'

function onDrag(element, callback) {
  let x = 0
  let y = 0
  let dragging = false
  let rect = element.getBoundingClientRect()

  if (!element) return
  if (element.getAttribute('drag-enabled') === 'true') return
  element.setAttribute('drag-enabled', 'true')
  element.setAttribute('dragging', 'false')

  const handleStart = function(e) {
    setXY(e)
    dragging = true
    element.setAttribute('dragging', 'true')
    const event = new CustomEvent('dragstart', { detail: getDetail() })
    element.dispatchEvent(event)
  }

  const handleMove = function(e) {
    if (!dragging) return
    setXY(e)
    const detail = getDetail()
    if (callback) callback(detail)
    const event = new CustomEvent('drag', { detail: detail })
    element.dispatchEvent(event)
  }

  const handleEnd = function() {
    dragging = false
    element.setAttribute('dragging', 'false')
    const event = new CustomEvent('dragend', { detail: getDetail() })
    element.dispatchEvent(event)
  }

  const setXY = function(e) {
    const carrier = e.touches ? e.touches[0] : e
    if (e.touches) e.preventDefault()
    x = carrier.clientX
    y = carrier.clientY
  }

  const getDetail = function() {
    const relativeX = x - rect.left
    const relativeY = y - rect.top
    const xPercentage = percentage(relativeX, rect.width)
    const yPercentage = percentage(relativeY, rect.height)

    const detail = {
      target: element,
      x: x,
      y: y,
      relativeX: relativeX,
      relativeY: relativeY,
      xPercentage: xPercentage,
      yPercentage: yPercentage
    }

    if (xPercentage < 0) detail.xPercentage = 0
    if (xPercentage > 100) detail.xPercentage = 100
    if (yPercentage < 0) detail.yPercentage = 0
    if (yPercentage > 100) detail.yPercentage = 100

    return detail
  }

  element.addEventListener('mousedown', handleStart)
  element.addEventListener('mousemove', handleMove)
  element.addEventListener('mouseup', handleEnd)
  element.addEventListener('touchstart', handleStart)
  element.addEventListener('touchmove', handleMove)
  element.addEventListener('touchend', handleEnd)

  return {
    destroy: function() {
      element.removeEventListener('mousedown', handleStart)
      element.removeEventListener('mousemove', handleMove)
      element.removeEventListener('mouseup', handleEnd)
      element.removeEventListener('touchstart', handleStart)
      element.removeEventListener('touchmove', handleMove)
      element.removeEventListener('touchend', handleEnd)
    }
  }
}

function onDragWithInertia(element, callback) {
  const friction = 0.9;
  let x = 0;
  let y = 0;
  let prevX = 0;
  let prevY = 0;
  let velocityX = 0;
  let velocityY = 0;
  let dragging = false;
  let rect = element.getBoundingClientRect();
  let inertiaId = null;

  const handleStart = function(e) {
    setXY(e);
    dragging = true;
    if (inertiaId) {
      cancelAnimationFrame(inertiaId);
      inertiaId = null;
    }
    const event = new CustomEvent('dragstart', { detail: getDetail() });
    element.dispatchEvent(event);
  };

  const handleMove = function(e) {
    if (!dragging) return;
    setXY(e);
    velocityX = x - prevX;
    velocityY = y - prevY;
    const detail = getDetail();
    if (callback) callback(detail);
    const event = new CustomEvent('drag', { detail: detail });
    element.dispatchEvent(event);
  };

  const handleEnd = function() {
    dragging = false;
    inertiaId = requestAnimationFrame(inertia);
    const event = new CustomEvent('dragend', { detail: getDetail() });
    element.dispatchEvent(event);
  };

  const setXY = function(e) {
    const carrier = e.touches ? e.touches[0] : e;
    if (e.touches) e.preventDefault();
    prevX = x;
    prevY = y;
    x = carrier.clientX;
    y = carrier.clientY;
  };

  const getDetail = function() {
    const relativeX = x - rect.left;
    const relativeY = y - rect.top;
    const xPercentage = percentage(relativeX, rect.width);
    const yPercentage = percentage(relativeY, rect.height);

    const detail = {
      target: element,
      x: x,
      y: y,
      relativeX: relativeX,
      relativeY: relativeY,
      xPercentage: xPercentage,
      yPercentage: yPercentage
    };

    if (xPercentage < 0) detail.xPercentage = 0;
    if (xPercentage > 100) detail.xPercentage = 100;
    if (yPercentage < 0) detail.yPercentage = 0;
    if (yPercentage > 100) detail.yPercentage = 100;

    return detail;
  };

  const inertia = function() {
    x += velocityX;
    y += velocityY;
    velocityX *= friction;
    velocityY *= friction;
    if (Math.abs(velocityX) < 0.1) velocityX = 0;
    if (Math.abs(velocityY) < 0.1) velocityY = 0;

    const detail = getDetail();

    if (velocityX !== 0 || velocityY !== 0) {
      if (callback) callback(detail);
      const event = new CustomEvent('draginertia', { detail: detail });
      element.dispatchEvent(event);
      inertiaId = requestAnimationFrame(inertia);
    } else {
      inertiaId = null;
      if (callback) callback(detail);
      const event = new CustomEvent('draginertiaend', { detail: detail });
      element.dispatchEvent(event);
    }
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
      if (inertiaId) {
        cancelAnimationFrame(inertiaId);
        inertiaId = null;
      }
    }
  };
}

export default class CompareImagesSlider {
  constructor(element, options) {
    this.element = element;
    this.frame = this.element.querySelector('.frame');
    this.second = this.frame.querySelector(':scope > img');
    this.handle = this.element.querySelector('.handle');

    this.options = {

    }

    window.addEventListener('resize', () => {
      requestAnimationFrame(this.setupSecondImage.bind(this));
    });
    this.setupSecondImage();

    this.drag = onDragWithInertia(this.element);
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
