import { drag } from 'book-of-spells/src/dom.mjs';
import { clamp } from 'book-of-spells/src/helpers.mjs';

// Longest gap between two presses still read as one double tap.
const DOUBLE_TAP_MS = 400;
// Travel, in percent, over which a press is a drag rather than a tap.
const TAP_SLOP = 1;

/**
 * Decide whether a press that has just ended completes a double tap.
 *
 * iOS Safari never fires `dblclick` from a double tap - the gesture is the browser's
 * own zoom - so the snap is detected from the pointer stream for every pointer type
 * rather than kept in two places that would disagree per platform.
 *
 * @param {number} now - Timestamp of the press that just ended.
 * @param {number} lastTapAt - Timestamp of the previous tap, 0 if there was none.
 * @param {number} movedBy - How far the press travelled, in percent.
 * @param {number} [windowMs=DOUBLE_TAP_MS] - Longest gap still counting as one gesture.
 * @param {number} [slop=TAP_SLOP] - Travel over which a press is a drag, not a tap.
 * @returns {boolean}
 */
export function isDoubleTap(now, lastTapAt, movedBy, windowMs = DOUBLE_TAP_MS, slop = TAP_SLOP) {
  if (movedBy > slop) return false;
  return lastTapAt > 0 && now - lastTapAt < windowMs;
}

/**
 * The extreme a snap sends the handle to - whichever edge it is further from, so a
 * repeated snap toggles rather than sitting still.
 * @param {number} position - Current position (0-100).
 * @returns {number}
 */
export function nearestExtreme(position) {
  return position < 50 ? 100 : 0;
}

/**
 * The event a move has just earned by arriving at an extreme, if it arrived at one.
 *
 * Edge-triggered: sitting at an extreme is not arriving at it. A held arrow key, an
 * inertia glide clamped at the edge for several frames, a second Home press - each
 * keeps the handle at 0 without reaching it again, and none of them fire.
 *
 * @param {number} previous - Position before the move.
 * @param {number} next - Position after it.
 * @returns {'start'|'end'|null}
 */
export function edgeEvent(previous, next) {
  if (next === previous) return null;
  if (next === 0) return 'start';
  if (next === 100) return 'end';
  return null;
}

/**
 * Next position for the splitter's Enter key: collapse the primary pane if it is
 * open, restore it to where it was before the collapse if it is not.
 * @param {number} position - Current position (0-100).
 * @param {number} restoreTo - Position recorded when the pane was last collapsed.
 * @returns {number}
 */
export function collapseToggle(position, restoreTo) {
  if (position !== 0) return 0;
  // A pane dragged to 0 before Enter was ever pressed has no recorded position to
  // restore, and restoring to 0 would leave Enter looking broken. Half open is the
  // only answer that is not another collapse.
  return restoreTo > 0 ? clamp(restoreTo, 0, 100) : 50;
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
 * What a connection should do about the required children.
 *
 * The parser inserts an element - and so fires `connectedCallback` - at its start tag,
 * before any child of it exists, so absent children are ambiguous on their own. The
 * document's ready state is what disambiguates: still `loading` means the parser has
 * not reached them yet, anything else means it has been and gone and the markup is
 * simply wrong.
 *
 * @param {boolean} hasChildren - Whether both required children are present.
 * @param {string} readyState - `document.readyState`.
 * @returns {'build'|'wait'|'fail'}
 */
export function upgradeAction(hasChildren, readyState) {
  if (hasChildren) return 'build';
  return readyState === 'loading' ? 'wait' : 'fail';
}


// The markup contract, in one place: the class looks these up, the custom element gates
// its upgrade on them, and the error messages quote them.
const REVEAL_SELECTOR = '.compare-images-slider-reveal';
const HANDLE_SELECTOR = '.compare-images-slider-handle';

/**
 * @class CompareImagesSlider
 * @classdesc Reveal one layer over another by dragging a handle. The two layers are
 * whatever the markup puts there - images, video, canvas, arbitrary elements - since
 * the reveal is clipped by percentage and nothing here measures the content.
 * The keyboard, the ARIA and the double tap are handled here; the gesture - the pointer and
 * the glide after it - is `drag()` from book-of-spells, which is the one runtime dependency.
 * @param {HTMLElement} element - The slider root element.
 * @param {Object} [options]
 * @param {boolean} [options.inertia=false] - Continue moving after a flick.
 * @param {boolean} [options.bounce=false] - Bounce off the edges under inertia.
 * @param {number} [options.friction=0.9] - Inertia decay per frame (0-1).
 * @param {number} [options.bounceFactor=0.1] - Energy kept on a bounce (0-1).
 * @param {number} [options.maxFlickVelocity=0.5] - Cap on flick velocity (%/ms).
 * @param {boolean} [options.dragAnywhere=false] - A press anywhere on the images starts a drag, not only the handle.
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
    this.reveal = this.element.querySelector(REVEAL_SELECTOR);
    this.handle = this.element.querySelector(HANDLE_SELECTOR);

    // Both are the contract, and both are used before the constructor returns. Saying so
    // beats the `null.setAttribute` that would land two calls deeper.
    if (!this.reveal || !this.handle) {
      throw new Error('CompareImagesSlider: the element needs a ' + REVEAL_SELECTOR + ' child holding the revealed layer, and a ' + HANDLE_SELECTOR + ' child');
    }

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
    // Where the last `change` left it. Seeded with the starting position, so an element
    // born at an extreme has not arrived anywhere and reports nothing.
    this.committedPosition = this.position;

    // Drag state. `gesture` is what book-of-spells' `drag()` hands back, and it is both the
    // flag saying one is running and the way to end it. `gliding` is the part of it after the
    // pointer has let go, when the gesture is `drag()`'s inertia carrying the handle on.
    this.gesture = null;
    this.gliding = false;
    this.pressPosition = 0;
    this.lastTapAt = 0;
    this.restorePosition = this.position;

    // Bound handlers so they can be removed on destroy.
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onDragCancel = this.onDragCancel.bind(this);
    this.onGlideEnd = this.onGlideEnd.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);

    this.setupAccessibility();

    this.dragTarget = this.options.dragAnywhere ? this.element : this.handle;
    // The stylesheet only sets `touch-action: none` on the handle; without this a touch
    // drag over the images is claimed by the browser's scroll gesture instead. Set
    // through `setProperty` because the manifest analyzer reads a plain style
    // assignment in the constructor as a class field.
    this.dragTarget.style.setProperty('touch-action', 'none');
    this.dragTarget.addEventListener('pointerdown', this.onPointerDown);
    this.handle.addEventListener('keydown', this.onKeyDown);

    this.render();
  }

  /**
   * Wire up the W3C APG Window Splitter pattern on the handle: a focusable
   * role="separator" reporting its position via ARIA. The pattern's keys live in
   * `onKeyDown` - arrows and Page Up/Down to move, Home/End to the extremes, Enter
   * to collapse and restore the pane named by `aria-controls`.
   * @see https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/
   */
  setupAccessibility() {
    if (!this.reveal.id) this.reveal.id = 'compare-images-slider-reveal-' + (++sliderCount);

    this.handle.setAttribute('role', 'separator');
    this.handle.setAttribute('tabindex', '0');
    this.handle.setAttribute('aria-controls', this.reveal.id);
    // A separator that splits left/right is itself vertical, and vice versa.
    this.handle.setAttribute('aria-orientation', this.options.vertical ? 'horizontal' : 'vertical');
    this.handle.setAttribute('aria-valuemin', '0');
    this.handle.setAttribute('aria-valuemax', '100');
    // The name is copied down from the element so a translated string can live in the
    // markup the author already writes. `aria-labelledby` first, as ARIA itself resolves
    // it - and it is the route that points at visible text, which is the one that gets
    // translated along with the page.
    if (!this.handle.hasAttribute('aria-label') && !this.handle.hasAttribute('aria-labelledby')) {
      const labelledby = this.element.getAttribute('aria-labelledby');
      if (labelledby) {
        this.handle.setAttribute('aria-labelledby', labelledby);
      } else {
        this.handle.setAttribute('aria-label', this.element.getAttribute('aria-label') || 'Image comparison slider');
      }
    }
  }

  onKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.stopGlide();
      const target = collapseToggle(this.position, this.restorePosition);
      if (this.position !== 0) this.restorePosition = this.position;
      this.setPosition(target);
      this.commit();
      return;
    }
    const next = keyboardStep(this.position, e.key, this.options.step, this.options.pageStep);
    if (next === null) return;
    e.preventDefault();
    this.stopGlide();
    this.setPosition(next);
    this.commit();
  }

  /** Double-click or double-tap snaps to the nearest extreme (0 or 100). */
  snapToExtreme() {
    this.setPosition(nearestExtreme(this.position));
    this.commit();
  }

  /**
   * Where along the slider a gesture is, out of what `drag()` measured.
   *
   * `within` is the slider root rather than the handle, so the percentage is along the track
   * the handle runs on rather than across the handle itself, and it is held at 0 and 100 when
   * the pointer runs off the end. The vertical layout is the same number down the other axis.
   *
   * @param {object} detail - A `drag()` detail.
   * @returns {number}
   */
  positionFromDrag(detail) {
    return this.options.vertical ? detail.yPercentage : detail.xPercentage;
  }

  /**
   * Take hold of the slider.
   *
   * The gesture is `drag()` from book-of-spells, started from this `pointerdown` rather than
   * handed the element to own: started that way it writes no attributes and no inline
   * `touch-action` into an element this class already set one on, and the `preventDefault`
   * below stays this class's to do. What `drag()` owns is the pointer - the capture, the
   * `pointercancel` path, the moves heard on the document - and the glide after it: the flick
   * sampled over a window and capped in per cent of the track, the friction, the walls of
   * `within`.
   *
   * What it is told differs from the options in two places. Its glide is two-dimensional
   * unless told the axis, and the velocity across a track can outlive the one along it by most
   * of a second - so it is told, and the glide is over when the handle is. And it is always
   * told to bounce: without bounce its glide carries on past the wall of `within` with
   * the percentage pinned to the edge, decaying out of sight for up to a second, whereas a
   * bounce that keeps nothing is the stop at the wall this element means by `bounce: false`.
   */
  onPointerDown(e) {
    // A second pointer during a drag is ignored; a press during a glide takes over from it.
    if (this.gesture && !this.gliding) return;
    this.endDrag();
    // Stops the compatibility mouse events, and with them both the text selection a press
    // starts and the native image drag a press on a picture would otherwise begin.
    e.preventDefault();

    // None of the four bubbles out of `drag()`, so they are heard on the target itself, and
    // all four come off again in `endDrag`.
    this.dragTarget.addEventListener('dragstart', this.onDragStart);
    this.dragTarget.addEventListener('dragend', this.onDragEnd);
    this.dragTarget.addEventListener('dragcancel', this.onDragCancel);
    this.dragTarget.addEventListener('draginertiaend', this.onGlideEnd);
    this.gesture = drag(e, {
      target: this.dragTarget,
      within: this.element,
      inertia: this.options.inertia,
      axis: this.options.vertical ? 'y' : 'x',
      friction: this.options.friction,
      bounce: true,
      bounceFactor: this.options.bounce ? this.options.bounceFactor : 0,
      maxVelocity: this.options.maxFlickVelocity + '%',
      callback: (detail) => this.follow(detail)
    });
  }

  /**
   * The press itself, once `drag()` has measured it.
   *
   * Read from the gesture rather than from the `pointerdown`, so the sum that turns a pointer
   * into a percentage lives in exactly one place.
   *
   * `dragstart` and `dragend` are the native drag and drop API's names too, and the native ones
   * bubble - with `dragAnywhere` the target is the whole slider, and an `<img>` inside it is
   * draggable without being asked. book-of-spells sends an object as `detail`; a native
   * `dragstart` carries the number `UIEvent` gives it, which is what tells the two apart.
   */
  onDragStart(e) {
    if (!e.detail || typeof e.detail !== 'object') return;
    const pos = this.positionFromDrag(e.detail);
    this.pressPosition = pos;
    this.setPosition(pos);
  }

  /** Every move `drag()` reports, under the pointer and through the glide alike. */
  follow(detail) {
    this.setPosition(this.positionFromDrag(detail));
  }

  onDragEnd(e) {
    if (!e.detail || typeof e.detail !== 'object') return;
    const now = performance.now();
    const movedBy = Math.abs(this.position - this.pressPosition);
    if (isDoubleTap(now, this.lastTapAt, movedBy)) {
      this.lastTapAt = 0;
      this.endDrag();
      this.snapToExtreme();
      return;
    }
    // A press that dragged is not the opening half of a double tap either.
    this.lastTapAt = movedBy > TAP_SLOP ? 0 : now;

    // Under inertia `drag()` has the first glide frame booked by the time it says `dragend`. A
    // flick is one gesture that outlives the finger, so the gesture stays alive for the glide
    // and `change` waits for it to settle rather than reporting where the finger let go.
    if (this.options.inertia) {
      this.gliding = true;
      return;
    }
    this.endDrag();
    this.commit();
  }

  /** The glide has settled - decayed, or stopped at the wall - and this is where `change` reports it. */
  onGlideEnd() {
    this.endDrag();
    this.commit();
  }

  /**
   * The system took the gesture away - a call arriving, the page scrolling out from
   * under the finger. iOS Safari raises this far more readily than a desktop browser
   * does. `drag()` drops the flick it was carrying and starts no glide, so the handle stops
   * where it stands rather than flying off on a flick nobody meant to throw.
   */
  onDragCancel(e) {
    if (!e.detail || typeof e.detail !== 'object') return;
    this.lastTapAt = 0;
    this.endDrag();
    this.commit();
  }

  /** Tear down a gesture, however it ended - under the pointer, through the glide, or cut short. */
  endDrag() {
    if (!this.gesture) return;
    this.gliding = false;
    this.dragTarget.removeEventListener('dragstart', this.onDragStart);
    this.dragTarget.removeEventListener('dragend', this.onDragEnd);
    this.dragTarget.removeEventListener('dragcancel', this.onDragCancel);
    this.dragTarget.removeEventListener('draginertiaend', this.onGlideEnd);
    // Releases the capture, takes the document listeners off and cancels a glide, and dispatches
    // nothing doing it - so ending a gesture from anywhere but its own end cannot come back
    // through these.
    this.gesture.destroy();
    this.gesture = null;
  }

  /** A key pressed mid-glide takes over from it; one pressed mid-drag leaves the pointer its gesture. */
  stopGlide() {
    if (this.gliding) this.endDrag();
  }

  /** Set the position (0-100), clamped, re-render and report the move. */
  setPosition(pct) {
    const previous = this.position;
    this.position = clamp(pct, 0, 100);
    this.render();
    if (this.position === previous) return;
    this.emit('input');
    const edge = edgeEvent(previous, this.position);
    if (edge) this.emit(edge);
  }

  /**
   * Report a settled position as `change`, the way a range input does - once a gesture
   * is over rather than throughout it. Silent when the gesture put the handle back where
   * it found it, so a press that goes nowhere is not a change.
   */
  commit() {
    if (this.position === this.committedPosition) return;
    this.committedPosition = this.position;
    this.emit('change');
  }

  /** @param {string} type - Event name; the position rides along as `detail.position`. */
  emit(type) {
    this.element.dispatchEvent(new CustomEvent(type, {
      bubbles: true,
      detail: { position: this.position }
    }));
  }

  render() {
    // One property for both axes and both parts: the stylesheet decides which edge of the
    // reveal layer is clipped back and which way the handle travels, so nothing here knows about
    // orientation, and nothing has to be recomputed when the slider is resized.
    this.element.style.setProperty('--compare-images-slider-position', this.position + '%');
    const rounded = Math.round(this.position);
    this.handle.setAttribute('aria-valuenow', String(rounded));
    this.handle.setAttribute('aria-valuetext', rounded + '%');
  }

  destroy() {
    this.element.style.removeProperty('--compare-images-slider-position');
    this.endDrag();
    this.dragTarget.removeEventListener('pointerdown', this.onPointerDown);
    this.dragTarget.style.removeProperty('touch-action');
    this.handle.removeEventListener('keydown', this.onKeyDown);
  }
}

export const DEFAULT_OPTIONS = {
  inertia: false,
  bounce: false,
  friction: 0.9,
  bounceFactor: 0.1,
  maxFlickVelocity: 0.5,
  dragAnywhere: false,
  vertical: false,
  initialPosition: 50,
  step: 5,
  pageStep: 25
};

// Boolean options settable via bare/`data-` attributes on the custom element.
const BOOL_OPTIONS = ['inertia', 'bounce', 'vertical', 'dragAnywhere'];
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
 * the images, reveal layer and handle stay fully stylable by the page author.
 *
 * Every attribute below is also readable as `data-*` or passed to the
 * `CompareImagesSlider` constructor in its camelCase form. The constructor reads the
 * element's attributes itself, so markup wins over the options object, `data-*` wins
 * over the bare attribute, and a boolean is turned off with `="false"` or `="0"`.
 *
 * @attr {boolean} [inertia=false] - Keep gliding after a flick.
 * @attr {boolean} [bounce=false] - Bounce off the edges while under inertia. Does nothing without `inertia`.
 * @attr {boolean} [vertical=false] - Split top and bottom instead of left and right.
 * @attr {boolean} [drag-anywhere=false] - A press anywhere on the images starts a drag, not only the handle.
 * @attr {number} [friction=0.9] - Inertia decay per frame, 0-1. Applied frame-rate independently, so the feel holds across displays.
 * @attr {number} [bounce-factor=0.1] - Energy kept on a bounce, 0-1.
 * @attr {number} [max-flick-velocity=0.5] - Cap on flick velocity, percent per millisecond.
 * @attr {number} [initial-position=50] - Starting position, 0-100. Paint it with `--compare-images-slider-initial-position` too, or the reveal layer is at 50% until the script runs.
 * @attr {number} [step=5] - Arrow-key step, in percent.
 * @attr {number} [page-step=25] - Page Up/Down step, in percent.
 *
 * @fires {CustomEvent<{ position: number }>} input - Every move as it happens - drag, key, inertia frame - like an `<input type="range">`. Silent when a move lands where the handle already was.
 * @fires {CustomEvent<{ position: number }>} change - The position has settled: a press released, a flick come to rest, a key pressed. Silent when the gesture ended where it started.
 * @fires {CustomEvent<{ position: number }>} start - The handle has just reached 0, the fully collapsed end. Fires on arrival, not while it sits there.
 * @fires {CustomEvent<{ position: number }>} end - The handle has just reached 100, the fully revealed end. Fires on arrival, not while it sits there.
 *
 * @cssprop {<length-percentage>} [--compare-images-slider-initial-position=50%] - Where the reveal edge sits before the script has run. Declared on `:root`, so it is the pre-upgrade paint and not the live position.
 * @cssprop {<length-percentage>} [--compare-images-slider-position] - The live reveal position, written inline by the script on every render. Read it to hang your own styling off the reveal; setting it is overwritten on the next move. Defaults to `--compare-images-slider-initial-position`.
 * @cssprop {<color>} [--compare-images-slider-handle-bg=#fff] - Handle fill.
 * @cssprop {<color>} [--compare-images-slider-handle-fg=#000] - Handle foreground — the knob's arrows.
 * @cssprop {<length>} [--compare-images-slider-handle-size=42px] - Handle diameter.
 * @cssprop {<length>} [--compare-images-slider-handle-font-size=28px] - Handle glyph size, for a handle drawn with text rather than the svg knob.
 */
export class CompareImagesSliderElement extends ElementBase {
  connectedCallback() {
    if (this.slider) return;
    const hasChildren = !!(this.querySelector(REVEAL_SELECTOR) && this.querySelector(HANDLE_SELECTOR));
    const action = upgradeAction(hasChildren, document.readyState);

    if (action === 'build') {
      this.slider = new CompareImagesSlider(this);
      return;
    }

    if (action === 'wait') {
      if (this.awaitingChildren) return;
      this.awaitingChildren = true;
      document.addEventListener('DOMContentLoaded', () => {
        this.awaitingChildren = false;
        // Connected is checked again because the element may have been taken back out
        // of the document while the rest of the page parsed, and a slider built on a
        // detached element would wire listeners nothing can reach.
        if (this.isConnected) this.connectedCallback();
      }, { once: true });
      return;
    }

    // The class throws here; this cannot, because nothing called it - a throw from a
    // reaction callback lands on `window.onerror` and leaves the page believing it
    // has a slider. Logging is the only way this path is heard.
    console.error('<compare-images-slider>: no slider was built. The element needs a ' + REVEAL_SELECTOR + ' child holding the revealed layer, and a ' + HANDLE_SELECTOR + ' child. Elements created after load must carry both before they are connected.', this);
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
