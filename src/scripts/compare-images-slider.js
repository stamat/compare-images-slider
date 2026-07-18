/**
 * Clamp a number to an inclusive range.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Compute a flick velocity (percent per millisecond) from recent pointer samples.
 *
 * The velocity is measured over a time window rather than a single frame delta.
 * A single-frame delta spikes on quick flicks - one large jump between the last
 * two move events makes inertia shoot straight to an extreme. Averaging the
 * displacement over the last `windowMs` of movement smooths those spikes out.
 *
 * @param {Array<{ t: number, pos: number }>} samples - Ordered pointer samples.
 * @param {number} [windowMs=80] - Look-back window in milliseconds.
 * @returns {number} Velocity in percent per millisecond (0 when undeterminable).
 */
export function sampleVelocity(samples, windowMs = 80) {
  if (!samples || samples.length < 2) return 0;
  const last = samples[samples.length - 1];
  let start = samples[0];
  // Walk back to the oldest sample still inside the window.
  for (let i = samples.length - 1; i >= 0; i--) {
    start = samples[i];
    if (last.t - samples[i].t >= windowMs) break;
  }
  const dt = last.t - start.t;
  if (dt <= 0) return 0;
  return (last.pos - start.pos) / dt;
}

/**
 * Cap the magnitude of a velocity while preserving its sign.
 * Prevents a hard flick from carrying the handle to an extreme every time.
 * @param {number} velocity
 * @param {number} max - Maximum absolute velocity.
 * @returns {number}
 */
export function capVelocity(velocity, max) {
  if (velocity > max) return max;
  if (velocity < -max) return -max;
  return velocity;
}

/**
 * @class CompareImagesSlider
 * @classdesc Compare two images by dragging a handle. Self-contained: pointer
 * physics, inertia, keyboard controls and ARIA are all handled here with no
 * runtime dependencies.
 * @param {HTMLElement} element - The slider root element.
 * @param {Object} [options]
 * @param {boolean} [options.inertia=false] - Continue moving after a flick.
 * @param {boolean} [options.bounce=false] - Bounce off the edges under inertia.
 * @param {number} [options.friction=0.9] - Inertia decay per frame (0-1).
 * @param {number} [options.bounceFactor=0.1] - Energy kept on a bounce (0-1).
 * @param {number} [options.maxFlickVelocity=0.5] - Cap on flick velocity (%/ms).
 * @param {boolean} [options.onlyHandle=true] - Only the handle starts a drag.
 * @param {boolean} [options.vertical=false] - Vertical (top/bottom) layout.
 * @param {number} [options.initialPosition=50] - Starting position (0-100).
 * @param {number} [options.step=5] - Arrow-key step (percent).
 * @param {number} [options.pageStep=25] - PageUp/PageDown step (percent).
 */
export default class CompareImagesSlider {
  constructor(element, options) {
    this.element = element;
    this.frame = this.element.querySelector('.frame');
    this.second = this.frame.querySelector(':scope > img');
    this.handle = this.element.querySelector('.handle');

    this.options = Object.assign({
      inertia: false,
      bounce: false,
      friction: 0.9,
      bounceFactor: 0.1,
      maxFlickVelocity: 0.5,
      onlyHandle: true,
      vertical: false,
      initialPosition: 50,
      step: 5,
      pageStep: 25
    }, options || {});

    this.checkAndApplyAttribute('vertical');
    this.checkAndApplyNumberAttribute('initialPosition', 'initial-position');
    if (this.options.vertical && !(this.element.dataset.vertical || this.element.hasAttribute('vertical'))) {
      this.element.setAttribute('vertical', '');
    }

    this.position = clamp(this.options.initialPosition, 0, 100);

    // Drag state.
    this.dragging = false;
    this.pointerId = null;
    this.samples = [];
    this.velocity = 0;
    this.inertiaId = null;
    this.lastFrameTime = 0;

    // Bound handlers so they can be removed on destroy.
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onResize = () => requestAnimationFrame(this.setupSecondImage.bind(this));

    window.addEventListener('resize', this.onResize);
    this.setupSecondImage();

    this.dragTarget = this.options.onlyHandle ? this.handle : this.element;
    this.dragTarget.addEventListener('pointerdown', this.onPointerDown);

    this.render();
  }

  checkAndApplyAttribute(attribute) {
    if (this.element.dataset[attribute] || this.element.hasAttribute(attribute)) this.options[attribute] = true;
  }

  /** Read a numeric option from a `data-*` or bare attribute if present. */
  checkAndApplyNumberAttribute(optionKey, attribute) {
    const raw = this.element.dataset[optionKey] != null
      ? this.element.dataset[optionKey]
      : this.element.getAttribute(attribute);
    if (raw == null || raw === '') return;
    const num = parseFloat(raw);
    if (!Number.isNaN(num)) this.options[optionKey] = num;
  }

  setupSecondImage() {
    this.second.style.width = this.element.offsetWidth + 'px';
  }

  /** Convert a client coordinate to a 0-100 position along the slider axis. */
  positionFromEvent(e) {
    const rect = this.element.getBoundingClientRect();
    if (this.options.vertical) {
      return clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
    }
    return clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
  }

  onPointerDown(e) {
    this.stopInertia();
    this.dragging = true;
    this.pointerId = e.pointerId;
    this.samples = [];
    if (this.dragTarget.setPointerCapture) this.dragTarget.setPointerCapture(e.pointerId);
    this.dragTarget.addEventListener('pointermove', this.onPointerMove);
    this.dragTarget.addEventListener('pointerup', this.onPointerUp);
    this.dragTarget.addEventListener('pointercancel', this.onPointerUp);
    this.pushSample(this.positionFromEvent(e));
    this.setPosition(this.positionFromEvent(e));
    e.preventDefault();
  }

  onPointerMove(e) {
    if (!this.dragging || e.pointerId !== this.pointerId) return;
    const pos = this.positionFromEvent(e);
    this.pushSample(pos);
    this.setPosition(pos);
  }

  onPointerUp(e) {
    if (!this.dragging || e.pointerId !== this.pointerId) return;
    this.dragging = false;
    this.dragTarget.removeEventListener('pointermove', this.onPointerMove);
    this.dragTarget.removeEventListener('pointerup', this.onPointerUp);
    this.dragTarget.removeEventListener('pointercancel', this.onPointerUp);
    if (this.dragTarget.releasePointerCapture) {
      try { this.dragTarget.releasePointerCapture(e.pointerId); } catch (_) { /* already released */ }
    }
    this.pointerId = null;

    if (this.options.inertia) {
      this.velocity = capVelocity(sampleVelocity(this.samples), this.options.maxFlickVelocity);
      if (Math.abs(this.velocity) > 0) this.startInertia();
    }
  }

  pushSample(pos) {
    this.samples.push({ t: performance.now(), pos: pos });
    // Keep the buffer small; only recent samples matter for velocity.
    if (this.samples.length > 10) this.samples.shift();
  }

  startInertia() {
    this.stopInertia();
    this.lastFrameTime = performance.now();
    const step = (now) => {
      const dt = now - this.lastFrameTime;
      this.lastFrameTime = now;

      let next = this.position + this.velocity * dt;
      // Frame-rate independent friction decay.
      this.velocity *= Math.pow(this.options.friction, dt / 16.6667);

      if (next <= 0 || next >= 100) {
        next = clamp(next, 0, 100);
        if (this.options.bounce) {
          this.velocity *= -this.options.bounceFactor;
        } else {
          this.velocity = 0;
        }
      }

      this.setPosition(next);

      if (Math.abs(this.velocity) < 0.0005) {
        this.inertiaId = null;
        return;
      }
      this.inertiaId = requestAnimationFrame(step);
    };
    this.inertiaId = requestAnimationFrame(step);
  }

  stopInertia() {
    if (this.inertiaId) {
      cancelAnimationFrame(this.inertiaId);
      this.inertiaId = null;
    }
  }

  /** Set the position (0-100), clamped, and re-render. */
  setPosition(pct) {
    this.position = clamp(pct, 0, 100);
    this.render();
  }

  render() {
    const value = this.position + '%';
    if (this.options.vertical) {
      this.frame.style.height = value;
      this.handle.style.top = value;
    } else {
      this.frame.style.width = value;
      this.handle.style.left = value;
    }
  }

  destroy() {
    this.stopInertia();
    window.removeEventListener('resize', this.onResize);
    this.dragTarget.removeEventListener('pointerdown', this.onPointerDown);
    this.dragTarget.removeEventListener('pointermove', this.onPointerMove);
    this.dragTarget.removeEventListener('pointerup', this.onPointerUp);
    this.dragTarget.removeEventListener('pointercancel', this.onPointerUp);
  }
}
