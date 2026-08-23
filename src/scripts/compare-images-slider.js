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
 * Compute the next position for a discrete keyboard action.
 * @param {number} current - Current position (0-100).
 * @param {string} key - KeyboardEvent.key value.
 * @param {number} step - Arrow-key step in percent.
 * @param {number} pageStep - Page-key step in percent.
 * @returns {number|null} New clamped position, or null if the key is unhandled.
 */
export function keyboardStep(current, key, step, pageStep) {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return clamp(current + step, 0, 100);
    case 'ArrowLeft':
    case 'ArrowUp':
      return clamp(current - step, 0, 100);
    case 'PageUp':
      return clamp(current + pageStep, 0, 100);
    case 'PageDown':
      return clamp(current - pageStep, 0, 100);
    case 'Home':
      return 0;
    case 'End':
      return 100;
    default:
      return null;
  }
}

// Monotonic counter for generating unique ids for aria-controls wiring.
let sliderCount = 0;

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
 *
 * Attributes on `element` override anything passed here - see `readOptionsFromElement`.
 */
export default class CompareImagesSlider {
  constructor(element, options) {
    this.element = element;
    this.frame = this.element.querySelector('.frame');
    this.second = this.frame.querySelector(':scope > img');
    this.handle = this.element.querySelector('.handle');

    this.options = resolveOptions(this.element, options);

    // The stylesheet keys the vertical layout off `[vertical]`/`[data-vertical]`, so an
    // attribute left disagreeing with the resolved option would style one axis while
    // the script drives the other.
    if (this.options.vertical) {
      this.element.setAttribute('vertical', '');
    } else {
      this.element.removeAttribute('vertical');
      this.element.removeAttribute('data-vertical');
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
    this.onPointerCancel = this.onPointerCancel.bind(this);
    this.onResize = () => requestAnimationFrame(this.setupSecondImage.bind(this));
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onDoubleClick = this.onDoubleClick.bind(this);

    window.addEventListener('resize', this.onResize);
    this.setupSecondImage();
    this.setupAccessibility();

    this.dragTarget = this.options.onlyHandle ? this.handle : this.element;
    // The stylesheet only sets `touch-action: none` on the handle; without this a touch
    // drag over the images is claimed by the browser's scroll gesture instead. Set
    // through `setProperty` because the manifest analyzer reads a plain style
    // assignment in the constructor as a class field.
    this.dragTarget.style.setProperty('touch-action', 'none');
    this.dragTarget.addEventListener('pointerdown', this.onPointerDown);
    this.handle.addEventListener('keydown', this.onKeyDown);
    this.handle.addEventListener('dblclick', this.onDoubleClick);

    this.render();
  }

  /**
   * Wire up the W3C APG Window Splitter pattern on the handle:
   * a focusable role="separator" reporting its position via ARIA.
   * @see https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/
   */
  setupAccessibility() {
    if (!this.frame.id) this.frame.id = 'compare-images-slider-frame-' + (++sliderCount);

    this.handle.setAttribute('role', 'separator');
    this.handle.setAttribute('tabindex', '0');
    this.handle.setAttribute('aria-controls', this.frame.id);
    // A separator that splits left/right is itself vertical, and vice versa.
    this.handle.setAttribute('aria-orientation', this.options.vertical ? 'horizontal' : 'vertical');
    this.handle.setAttribute('aria-valuemin', '0');
    this.handle.setAttribute('aria-valuemax', '100');
    if (!this.handle.hasAttribute('aria-label') && !this.handle.hasAttribute('aria-labelledby')) {
      this.handle.setAttribute('aria-label', this.element.getAttribute('aria-label') || 'Image comparison slider');
    }
  }

  onKeyDown(e) {
    const next = keyboardStep(this.position, e.key, this.options.step, this.options.pageStep);
    if (next === null) return;
    e.preventDefault();
    this.stopInertia();
    this.setPosition(next);
  }

  /** Double-click the handle to snap to the nearest extreme (0 or 100). */
  onDoubleClick() {
    this.stopInertia();
    this.setPosition(this.position < 50 ? 100 : 0);
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
    this.dragTarget.addEventListener('pointercancel', this.onPointerCancel);
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
    this.endDrag(e);

    if (this.options.inertia) {
      this.velocity = capVelocity(sampleVelocity(this.samples), this.options.maxFlickVelocity);
      if (Math.abs(this.velocity) > 0) this.startInertia();
    }
  }

  /**
   * The system took the gesture away - a call arriving, the page scrolling out from
   * under the finger. iOS Safari raises this far more readily than a desktop browser
   * does. The samples describe a gesture the user never finished, so the handle stops
   * where it stands rather than flying off on a flick nobody meant to throw.
   */
  onPointerCancel(e) {
    if (!this.dragging || e.pointerId !== this.pointerId) return;
    this.endDrag(e);
  }

  /** Tear down a drag, however it ended. */
  endDrag(e) {
    this.dragging = false;
    this.dragTarget.removeEventListener('pointermove', this.onPointerMove);
    this.dragTarget.removeEventListener('pointerup', this.onPointerUp);
    this.dragTarget.removeEventListener('pointercancel', this.onPointerCancel);
    if (this.dragTarget.releasePointerCapture) {
      try { this.dragTarget.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    }
    this.pointerId = null;
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
    const rounded = Math.round(this.position);
    this.handle.setAttribute('aria-valuenow', String(rounded));
    this.handle.setAttribute('aria-valuetext', rounded + '%');
  }

  destroy() {
    this.stopInertia();
    window.removeEventListener('resize', this.onResize);
    this.dragTarget.removeEventListener('pointerdown', this.onPointerDown);
    this.dragTarget.removeEventListener('pointermove', this.onPointerMove);
    this.dragTarget.removeEventListener('pointerup', this.onPointerUp);
    this.dragTarget.removeEventListener('pointercancel', this.onPointerCancel);
    this.dragTarget.style.removeProperty('touch-action');
    this.handle.removeEventListener('keydown', this.onKeyDown);
    this.handle.removeEventListener('dblclick', this.onDoubleClick);
  }
}

export const DEFAULT_OPTIONS = {
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
};

// Boolean options settable via bare/`data-` attributes on the custom element.
const BOOL_OPTIONS = ['inertia', 'bounce', 'vertical', 'onlyHandle'];
// Numeric options and the attribute name they map to.
const NUMBER_OPTIONS = {
  friction: 'friction',
  bounceFactor: 'bounce-factor',
  maxFlickVelocity: 'max-flick-velocity',
  initialPosition: 'initial-position',
  step: 'step',
  pageStep: 'page-step'
};

/**
 * Read slider options from an element's attributes (bare, `data-*` or kebab).
 * @param {HTMLElement} el
 * @returns {Object}
 */
export function readOptionsFromElement(el) {
  const options = {};
  for (const key of BOOL_OPTIONS) {
    const kebab = key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
    const raw = el.dataset[key] != null ? el.dataset[key] : el.getAttribute(kebab);
    if (raw == null) continue;
    options[key] = raw !== 'false' && raw !== '0';
  }
  for (const key in NUMBER_OPTIONS) {
    const raw = el.dataset[key] != null ? el.dataset[key] : el.getAttribute(NUMBER_OPTIONS[key]);
    if (raw == null || raw === '') continue;
    const num = parseFloat(raw);
    if (!Number.isNaN(num)) options[key] = num;
  }
  return options;
}

/**
 * Merge the three option sources into one. Attributes are applied last, so markup
 * wins over the options object - which is what `vertical` did back when it was the
 * only attribute the constructor honoured.
 * @param {HTMLElement} el
 * @param {Object} [options]
 * @returns {Object}
 */
export function resolveOptions(el, options) {
  return Object.assign({}, DEFAULT_OPTIONS, options || {}, readOptionsFromElement(el));
}

// Fall back to a plain base when HTMLElement is absent (e.g. Node under test),
// so the module stays importable outside the browser.
const ElementBase = typeof HTMLElement !== 'undefined' ? HTMLElement : class {};

/**
 * `<compare-images-slider>` custom element. Uses light DOM (no shadow root) so
 * the images, frame and handle stay fully stylable by the page author.
 *
 * Every attribute below is also readable as `data-*` or passed to the
 * `CompareImagesSlider` constructor in its camelCase form. The constructor reads the
 * element's attributes itself, so markup wins over the options object, `data-*` wins
 * over the bare attribute, and a boolean is turned off with `="false"` or `="0"`.
 *
 * @attr {boolean} [inertia=false] - Keep gliding after a flick.
 * @attr {boolean} [bounce=false] - Bounce off the edges while under inertia. Does nothing without `inertia`.
 * @attr {boolean} [vertical=false] - Split top and bottom instead of left and right.
 * @attr {boolean} [only-handle=true] - Only the handle starts a drag. Off, a press anywhere on the images does.
 * @attr {number} [friction=0.9] - Inertia decay per frame, 0-1. Applied frame-rate independently, so the feel holds across displays.
 * @attr {number} [bounce-factor=0.1] - Energy kept on a bounce, 0-1.
 * @attr {number} [max-flick-velocity=0.5] - Cap on flick velocity, percent per millisecond.
 * @attr {number} [initial-position=50] - Starting position, 0-100. Paint it with `--compare-images-slider-initial-position` too, or the frame is at 50% until the script runs.
 * @attr {number} [step=5] - Arrow-key step, in percent.
 * @attr {number} [page-step=25] - Page Up/Down step, in percent.
 *
 * @cssprop {<length-percentage>} [--compare-images-slider-initial-position=50%] - Where the reveal edge sits before the script has run. Declared on `:root`, so it is the pre-upgrade paint and not the live position.
 * @cssprop {<color>} [--compare-images-slider-handle-bg=#fff] - Handle fill.
 * @cssprop {<color>} [--compare-images-slider-handle-fg=#000] - Handle foreground — the knob's arrows.
 * @cssprop {<length>} [--compare-images-slider-handle-size=42px] - Handle diameter.
 * @cssprop {<length>} [--compare-images-slider-handle-font-size=28px] - Handle glyph size, for a handle drawn with text rather than the svg knob.
 */
export class CompareImagesSliderElement extends ElementBase {
  connectedCallback() {
    // Wait until the required light-DOM children have been parsed.
    if (this.slider || !this.querySelector('.frame') || !this.querySelector('.handle')) return;
    this.slider = new CompareImagesSlider(this);
  }

  disconnectedCallback() {
    if (this.slider) {
      this.slider.destroy();
      this.slider = null;
    }
  }
}

// Register on load in the browser only; guarded so the module is safe to import
// under Node (tests) where custom elements do not exist.
if (typeof customElements !== 'undefined' && !customElements.get('compare-images-slider')) {
  customElements.define('compare-images-slider', CompareImagesSliderElement);
}
