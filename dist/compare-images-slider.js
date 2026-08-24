/* compare-images-slider v4.0.0 | https://stamat.github.io/compare-images-slider/ | MIT License */
(() => {
  // node_modules/book-of-spells/src/helpers.mjs
  function shallowMerge(target, source) {
    for (const key of Object.keys(source)) {
      if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
      target[key] = source[key];
    }
    return target;
  }
  var objProto = Object.prototype;
  var foldF64 = new Float64Array(1);
  var foldU32 = new Uint32Array(foldF64.buffer);
  function isObject(o) {
    return typeof o === "object" && !Array.isArray(o) && o !== null;
  }
  function isFunction(o) {
    return typeof o === "function";
  }
  var PLAIN = {
    \u00C6: "AE",
    \u00E6: "ae",
    \u0152: "OE",
    \u0153: "oe",
    \u00DF: "ss",
    "\u1E9E": "SS",
    \u00DE: "TH",
    \u00FE: "th",
    \u0110: "D",
    \u0111: "d",
    \u00D0: "D",
    \u00F0: "d",
    \u00D8: "O",
    \u00F8: "o",
    \u0141: "L",
    \u0142: "l",
    \u013F: "L",
    \u0140: "l",
    \u0126: "H",
    \u0127: "h",
    \u0166: "T",
    \u0167: "t",
    \u01E4: "G",
    \u01E5: "g",
    \u014A: "N",
    \u014B: "n",
    \u0131: "i"
  };
  var PLAIN_RE = new RegExp(`[${Object.keys(PLAIN).join("")}]`, "g");
  function percentage(num, total) {
    if (Number.isNaN(num) || Number.isNaN(total) || total === 0) return 0;
    return num / total * 100;
  }
  function clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }
  function sampleVelocity(samples, windowMs = 80) {
    const result = {};
    if (!samples || !samples.length) return result;
    const last = samples[samples.length - 1];
    const keys = Object.keys(last).filter((key) => key !== "t" && typeof last[key] === "number");
    for (const key of keys) result[key] = 0;
    if (samples.length < 2) return result;
    let start = samples[0];
    for (let i = samples.length - 1; i >= 0; i--) {
      start = samples[i];
      if (last.t - samples[i].t >= windowMs) break;
    }
    const dt = last.t - start.t;
    if (dt <= 0) return result;
    for (const key of keys) result[key] = (last[key] - start[key]) / dt;
    return result;
  }

  // node_modules/book-of-spells/src/dom.mjs
  var dragging = /* @__PURE__ */ new WeakSet();
  function drag(target, opts) {
    const fromEvent = !!target && typeof target === "object" && target.type === "pointerdown" && "pointerId" in target;
    const element = fromEvent ? isObject(opts) && opts.target || target.currentTarget || target.target : target;
    if (!element || !(element instanceof Element)) return;
    if (!fromEvent && element.getAttribute("drag-enabled") === "true") return;
    if (fromEvent && dragging.has(element)) return;
    const doc = element.ownerDocument;
    let x = 0;
    let y = 0;
    let clientX = 0;
    let clientY = 0;
    let prevX = 0;
    let prevY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let pointerId = null;
    let pointerType = "";
    let rect = null;
    let inertiaId = null;
    let inertiaTime = 0;
    let samples = [];
    const options = {
      within: null,
      inertia: false,
      bounce: false,
      friction: 0.9,
      bounceFactor: 0.2,
      velocityWindow: 80,
      maxVelocity: 2,
      axis: null,
      callback: null,
      preventDefaultTouch: true
    };
    if (isFunction(opts)) {
      options.callback = opts;
    } else if (isObject(opts)) {
      shallowMerge(options, opts);
    }
    options.friction = Math.abs(options.friction);
    options.bounceFactor = Math.abs(options.bounceFactor);
    const capInPercent = typeof options.maxVelocity === "string" && options.maxVelocity.trim().endsWith("%");
    const cap = Math.abs(parseFloat(options.maxVelocity));
    options.maxVelocity = Number.isNaN(cap) ? 2 : cap;
    let capX = options.maxVelocity;
    let capY = options.maxVelocity;
    const measureVelocity = function() {
      const v = sampleVelocity(samples, options.velocityWindow);
      velocityX = options.axis === "y" ? 0 : clamp(v.x || 0, -capX, capX);
      velocityY = options.axis === "x" ? 0 : clamp(v.y || 0, -capY, capY);
    };
    if (!fromEvent) {
      element.setAttribute("drag-enabled", "true");
      element.setAttribute("dragging", "false");
    }
    const ownTouchAction = element.style.touchAction || "";
    if (!fromEvent && options.preventDefaultTouch) element.style.touchAction = "none";
    const measured = options.within instanceof Element ? options.within : element;
    const calcPageRelativeRect = function() {
      const origRect = measured.getBoundingClientRect();
      const rect2 = {
        top: origRect.top + window.scrollY,
        left: origRect.left + window.scrollX,
        width: origRect.width,
        height: origRect.height
      };
      return rect2;
    };
    const handleStart = function(e) {
      if (dragging.has(element)) return;
      dragging.add(element);
      samples = [];
      pointerId = e.pointerId;
      pointerType = e.pointerType || "";
      setXY(e);
      prevX = x;
      prevY = y;
      rect = calcPageRelativeRect();
      if (capInPercent) {
        capX = rect.width * options.maxVelocity / 100;
        capY = rect.height * options.maxVelocity / 100;
      }
      if (!fromEvent) element.setAttribute("dragging", "true");
      if (element.setPointerCapture) {
        try {
          element.setPointerCapture(e.pointerId);
        } catch {
        }
      }
      doc.addEventListener("pointermove", handleMove);
      doc.addEventListener("pointerup", handleEnd);
      doc.addEventListener("pointercancel", handleCancel);
      if (inertiaId) {
        cancelAnimationFrame(inertiaId);
        inertiaId = null;
      }
      const event = new CustomEvent("dragstart", { detail: getDetail() });
      element.dispatchEvent(event);
    };
    const handleMove = function(e) {
      if (e.pointerId !== pointerId) return;
      if (e.clientX === clientX && e.clientY === clientY && e.pageX === x && e.pageY === y) return;
      setXY(e);
      measureVelocity();
      const detail = getDetail();
      if (options.callback) options.callback(detail);
      const event = new CustomEvent("drag", { detail });
      element.dispatchEvent(event);
    };
    const stop = function() {
      dragging.delete(element);
      if (!fromEvent) element.setAttribute("dragging", "false");
      doc.removeEventListener("pointermove", handleMove);
      doc.removeEventListener("pointerup", handleEnd);
      doc.removeEventListener("pointercancel", handleCancel);
      if (element.hasPointerCapture && element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
      pointerId = null;
    };
    const handleEnd = function(e) {
      if (e.pointerId !== pointerId) return;
      stop();
      const t = performance.now();
      samples.push({ t, x, y });
      measureVelocity();
      inertiaTime = t;
      if (options.inertia) inertiaId = requestAnimationFrame(inertia);
      const event = new CustomEvent("dragend", { detail: getDetail() });
      element.dispatchEvent(event);
    };
    const handleCancel = function(e) {
      if (e.pointerId !== pointerId) return;
      stop();
      velocityX = 0;
      velocityY = 0;
      samples = [];
      const event = new CustomEvent("dragcancel", { detail: getDetail() });
      element.dispatchEvent(event);
    };
    const setXY = function(e) {
      prevX = x;
      prevY = y;
      x = e.pageX;
      y = e.pageY;
      clientX = e.clientX;
      clientY = e.clientY;
      samples.push({ t: performance.now(), x, y });
      if (samples.length > 12) samples.shift();
    };
    const getDetail = function() {
      const relativeX = x - rect.left;
      const relativeY = y - rect.top;
      const xPercentage = percentage(relativeX, rect.width);
      const yPercentage = percentage(relativeY, rect.height);
      const detail = {
        target: element,
        x,
        y,
        clientX,
        clientY,
        relativeX,
        relativeY,
        xPercentage,
        yPercentage,
        velocityX,
        velocityY,
        prevX,
        prevY,
        pointerType
      };
      if (xPercentage < 0) detail.xPercentage = 0;
      if (xPercentage > 100) detail.xPercentage = 100;
      if (yPercentage < 0) detail.yPercentage = 0;
      if (yPercentage > 100) detail.yPercentage = 100;
      return detail;
    };
    const inertia = function() {
      const t = performance.now();
      const dt = t - inertiaTime;
      inertiaTime = t;
      x += velocityX * dt;
      y += velocityY * dt;
      const decay = Math.pow(options.friction, dt / 16.6667);
      velocityX *= decay;
      velocityY *= decay;
      if (options.bounce) {
        if (x < rect.left) {
          x = rect.left;
          velocityX *= -options.bounceFactor;
        }
        if (x > rect.width + rect.left) {
          x = rect.width + rect.left;
          velocityX *= -options.bounceFactor;
        }
        if (y < rect.top) {
          y = rect.top;
          velocityY *= -options.bounceFactor;
        }
        if (y > rect.height + rect.top) {
          y = rect.height + rect.top;
          velocityY *= -options.bounceFactor;
        }
      }
      if (Math.abs(velocityX) < 0.01) velocityX = 0;
      if (Math.abs(velocityY) < 0.01) velocityY = 0;
      const detail = getDetail();
      if (velocityX !== 0 || velocityY !== 0) {
        inertiaId = requestAnimationFrame(inertia);
        if (options.callback) options.callback(detail);
        const event = new CustomEvent("draginertia", { detail });
        element.dispatchEvent(event);
      } else {
        inertiaId = null;
        if (options.callback) options.callback(detail);
        const event = new CustomEvent("draginertiaend", { detail });
        element.dispatchEvent(event);
      }
    };
    if (fromEvent) handleStart(target);
    else element.addEventListener("pointerdown", handleStart);
    return {
      //TODO: add manual start, move and end methods - for programmatic control
      destroy: function() {
        if (pointerId !== null) stop();
        if (!fromEvent) {
          element.removeEventListener("pointerdown", handleStart);
          element.style.touchAction = ownTouchAction;
          element.removeAttribute("drag-enabled");
          element.removeAttribute("dragging");
        }
        if (inertiaId) {
          cancelAnimationFrame(inertiaId);
          inertiaId = null;
        }
      }
    };
  }

  // src/scripts/compare-images-slider.js
  var DOUBLE_TAP_MS = 400;
  var TAP_SLOP = 1;
  function isDoubleTap(now, lastTapAt, movedBy, windowMs = DOUBLE_TAP_MS, slop = TAP_SLOP) {
    if (movedBy > slop) return false;
    return lastTapAt > 0 && now - lastTapAt < windowMs;
  }
  function nearestExtreme(position) {
    return position < 50 ? 100 : 0;
  }
  function edgeEvent(previous, next) {
    if (next === previous) return null;
    if (next === 0) return "start";
    if (next === 100) return "end";
    return null;
  }
  function collapseToggle(position, restoreTo) {
    if (position !== 0) return 0;
    return restoreTo > 0 ? clamp(restoreTo, 0, 100) : 50;
  }
  function keyboardStep(current, key, step, pageStep) {
    switch (key) {
      case "ArrowRight":
      case "ArrowDown":
        return clamp(current + step, 0, 100);
      case "ArrowLeft":
      case "ArrowUp":
        return clamp(current - step, 0, 100);
      case "PageUp":
        return clamp(current + pageStep, 0, 100);
      case "PageDown":
        return clamp(current - pageStep, 0, 100);
      case "Home":
        return 0;
      case "End":
        return 100;
      default:
        return null;
    }
  }
  var sliderCount = 0;
  function upgradeAction(hasChildren, readyState) {
    if (hasChildren) return "build";
    return readyState === "loading" ? "wait" : "fail";
  }
  var REVEAL_SELECTOR = ".compare-images-slider-reveal";
  var HANDLE_SELECTOR = ".compare-images-slider-handle";
  var CompareImagesSlider = class {
    constructor(element, options) {
      this.element = element;
      this.reveal = this.element.querySelector(REVEAL_SELECTOR);
      this.handle = this.element.querySelector(HANDLE_SELECTOR);
      if (!this.reveal || !this.handle) {
        throw new Error("CompareImagesSlider: the element needs a " + REVEAL_SELECTOR + " child holding the revealed layer, and a " + HANDLE_SELECTOR + " child");
      }
      this.options = resolveOptions(this.element, options);
      if (this.options.vertical) {
        this.element.setAttribute("vertical", "");
      } else {
        this.element.removeAttribute("vertical");
        this.element.removeAttribute("data-vertical");
      }
      this.position = clamp(this.options.initialPosition, 0, 100);
      this.committedPosition = this.position;
      this.gesture = null;
      this.gliding = false;
      this.pressPosition = 0;
      this.lastTapAt = 0;
      this.restorePosition = this.position;
      this.onPointerDown = this.onPointerDown.bind(this);
      this.onDragStart = this.onDragStart.bind(this);
      this.onDragEnd = this.onDragEnd.bind(this);
      this.onDragCancel = this.onDragCancel.bind(this);
      this.onGlideEnd = this.onGlideEnd.bind(this);
      this.onKeyDown = this.onKeyDown.bind(this);
      this.setupAccessibility();
      this.dragTarget = this.options.dragAnywhere ? this.element : this.handle;
      this.dragTarget.style.setProperty("touch-action", "none");
      this.dragTarget.addEventListener("pointerdown", this.onPointerDown);
      this.handle.addEventListener("keydown", this.onKeyDown);
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
      if (!this.reveal.id) this.reveal.id = "compare-images-slider-reveal-" + ++sliderCount;
      this.handle.setAttribute("role", "separator");
      this.handle.setAttribute("tabindex", "0");
      this.handle.setAttribute("aria-controls", this.reveal.id);
      this.handle.setAttribute("aria-orientation", this.options.vertical ? "horizontal" : "vertical");
      this.handle.setAttribute("aria-valuemin", "0");
      this.handle.setAttribute("aria-valuemax", "100");
      if (!this.handle.hasAttribute("aria-label") && !this.handle.hasAttribute("aria-labelledby")) {
        const labelledby = this.element.getAttribute("aria-labelledby");
        if (labelledby) {
          this.handle.setAttribute("aria-labelledby", labelledby);
        } else {
          this.handle.setAttribute("aria-label", this.element.getAttribute("aria-label") || "Image comparison slider");
        }
      }
    }
    onKeyDown(e) {
      if (e.key === "Enter") {
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
      if (this.gesture && !this.gliding) return;
      this.endDrag();
      e.preventDefault();
      this.dragTarget.addEventListener("dragstart", this.onDragStart);
      this.dragTarget.addEventListener("dragend", this.onDragEnd);
      this.dragTarget.addEventListener("dragcancel", this.onDragCancel);
      this.dragTarget.addEventListener("draginertiaend", this.onGlideEnd);
      this.gesture = drag(e, {
        target: this.dragTarget,
        within: this.element,
        inertia: this.options.inertia,
        axis: this.options.vertical ? "y" : "x",
        friction: this.options.friction,
        bounce: true,
        bounceFactor: this.options.bounce ? this.options.bounceFactor : 0,
        maxVelocity: this.options.maxFlickVelocity + "%",
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
      if (!e.detail || typeof e.detail !== "object") return;
      const pos = this.positionFromDrag(e.detail);
      this.pressPosition = pos;
      this.setPosition(pos);
    }
    /** Every move `drag()` reports, under the pointer and through the glide alike. */
    follow(detail) {
      this.setPosition(this.positionFromDrag(detail));
    }
    onDragEnd(e) {
      if (!e.detail || typeof e.detail !== "object") return;
      const now = performance.now();
      const movedBy = Math.abs(this.position - this.pressPosition);
      if (isDoubleTap(now, this.lastTapAt, movedBy)) {
        this.lastTapAt = 0;
        this.endDrag();
        this.snapToExtreme();
        return;
      }
      this.lastTapAt = movedBy > TAP_SLOP ? 0 : now;
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
      if (!e.detail || typeof e.detail !== "object") return;
      this.lastTapAt = 0;
      this.endDrag();
      this.commit();
    }
    /** Tear down a gesture, however it ended - under the pointer, through the glide, or cut short. */
    endDrag() {
      if (!this.gesture) return;
      this.gliding = false;
      this.dragTarget.removeEventListener("dragstart", this.onDragStart);
      this.dragTarget.removeEventListener("dragend", this.onDragEnd);
      this.dragTarget.removeEventListener("dragcancel", this.onDragCancel);
      this.dragTarget.removeEventListener("draginertiaend", this.onGlideEnd);
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
      this.emit("input");
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
      this.emit("change");
    }
    /** @param {string} type - Event name; the position rides along as `detail.position`. */
    emit(type) {
      this.element.dispatchEvent(new CustomEvent(type, {
        bubbles: true,
        detail: { position: this.position }
      }));
    }
    render() {
      this.element.style.setProperty("--compare-images-slider-position", this.position + "%");
      const rounded = Math.round(this.position);
      this.handle.setAttribute("aria-valuenow", String(rounded));
      this.handle.setAttribute("aria-valuetext", rounded + "%");
    }
    destroy() {
      this.element.style.removeProperty("--compare-images-slider-position");
      this.endDrag();
      this.dragTarget.removeEventListener("pointerdown", this.onPointerDown);
      this.dragTarget.style.removeProperty("touch-action");
      this.handle.removeEventListener("keydown", this.onKeyDown);
    }
  };
  var DEFAULT_OPTIONS = {
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
  var BOOL_OPTIONS = ["inertia", "bounce", "vertical", "dragAnywhere"];
  var NUMBER_OPTIONS = {
    friction: "friction",
    bounceFactor: "bounce-factor",
    maxFlickVelocity: "max-flick-velocity",
    initialPosition: "initial-position",
    step: "step",
    pageStep: "page-step"
  };
  function readOptionsFromElement(el) {
    const options = {};
    for (const key of BOOL_OPTIONS) {
      const kebab = key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
      const raw = el.dataset[key] != null ? el.dataset[key] : el.getAttribute(kebab);
      if (raw == null) continue;
      options[key] = raw !== "false" && raw !== "0";
    }
    for (const key in NUMBER_OPTIONS) {
      const raw = el.dataset[key] != null ? el.dataset[key] : el.getAttribute(NUMBER_OPTIONS[key]);
      if (raw == null || raw === "") continue;
      const num = parseFloat(raw);
      if (!Number.isNaN(num)) options[key] = num;
    }
    return options;
  }
  function resolveOptions(el, options) {
    return Object.assign({}, DEFAULT_OPTIONS, options || {}, readOptionsFromElement(el));
  }
  var ElementBase = typeof HTMLElement !== "undefined" ? HTMLElement : class {
  };
  var CompareImagesSliderElement = class extends ElementBase {
    connectedCallback() {
      if (this.slider) return;
      const hasChildren = !!(this.querySelector(REVEAL_SELECTOR) && this.querySelector(HANDLE_SELECTOR));
      const action = upgradeAction(hasChildren, document.readyState);
      if (action === "build") {
        this.slider = new CompareImagesSlider(this);
        return;
      }
      if (action === "wait") {
        if (this.awaitingChildren) return;
        this.awaitingChildren = true;
        document.addEventListener("DOMContentLoaded", () => {
          this.awaitingChildren = false;
          if (this.isConnected) this.connectedCallback();
        }, { once: true });
        return;
      }
      console.error("<compare-images-slider>: no slider was built. The element needs a " + REVEAL_SELECTOR + " child holding the revealed layer, and a " + HANDLE_SELECTOR + " child. Elements created after load must carry both before they are connected.", this);
    }
    disconnectedCallback() {
      if (this.slider) {
        this.slider.destroy();
        this.slider = null;
      }
    }
  };
  if (typeof customElements !== "undefined" && !customElements.get("compare-images-slider")) {
    customElements.define("compare-images-slider", CompareImagesSliderElement);
  }

  // src/scripts/iife.js
  if (!window.CompareImagesSlider) {
    window.CompareImagesSlider = CompareImagesSlider;
    window.CompareImagesSliderElement = CompareImagesSliderElement;
    document.dispatchEvent(new CustomEvent("CompareImagesSliderLoaded"));
  }
})();
//# sourceMappingURL=compare-images-slider.js.map
