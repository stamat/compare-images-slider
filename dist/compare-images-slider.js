/* compare-images-slider v2.0.0 | https://stamat.github.io/compare-images-slider/ | MIT License */
(() => {
  // src/scripts/compare-images-slider.js
  function clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }
  function sampleVelocity(samples, windowMs = 80) {
    if (!samples || samples.length < 2) return 0;
    const last = samples[samples.length - 1];
    let start = samples[0];
    for (let i = samples.length - 1; i >= 0; i--) {
      start = samples[i];
      if (last.t - samples[i].t >= windowMs) break;
    }
    const dt = last.t - start.t;
    if (dt <= 0) return 0;
    return (last.pos - start.pos) / dt;
  }
  function capVelocity(velocity, max) {
    if (velocity > max) return max;
    if (velocity < -max) return -max;
    return velocity;
  }
  var DOUBLE_TAP_MS = 400;
  var TAP_SLOP = 1;
  function isDoubleTap(now, lastTapAt, movedBy, windowMs = DOUBLE_TAP_MS, slop = TAP_SLOP) {
    if (movedBy > slop) return false;
    return lastTapAt > 0 && now - lastTapAt < windowMs;
  }
  function nearestExtreme(position) {
    return position < 50 ? 100 : 0;
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
  var CompareImagesSlider = class {
    constructor(element, options) {
      this.element = element;
      this.frame = this.element.querySelector(".frame");
      this.handle = this.element.querySelector(".handle");
      this.options = resolveOptions(this.element, options);
      if (this.options.vertical) {
        this.element.setAttribute("vertical", "");
      } else {
        this.element.removeAttribute("vertical");
        this.element.removeAttribute("data-vertical");
      }
      this.position = clamp(this.options.initialPosition, 0, 100);
      this.dragging = false;
      this.pointerId = null;
      this.samples = [];
      this.velocity = 0;
      this.inertiaId = null;
      this.lastFrameTime = 0;
      this.pressPosition = 0;
      this.lastTapAt = 0;
      this.restorePosition = this.position;
      this.onPointerDown = this.onPointerDown.bind(this);
      this.onPointerMove = this.onPointerMove.bind(this);
      this.onPointerUp = this.onPointerUp.bind(this);
      this.onPointerCancel = this.onPointerCancel.bind(this);
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
      if (!this.frame.id) this.frame.id = "compare-images-slider-frame-" + ++sliderCount;
      this.handle.setAttribute("role", "separator");
      this.handle.setAttribute("tabindex", "0");
      this.handle.setAttribute("aria-controls", this.frame.id);
      this.handle.setAttribute("aria-orientation", this.options.vertical ? "horizontal" : "vertical");
      this.handle.setAttribute("aria-valuemin", "0");
      this.handle.setAttribute("aria-valuemax", "100");
      if (!this.handle.hasAttribute("aria-label") && !this.handle.hasAttribute("aria-labelledby")) {
        this.handle.setAttribute("aria-label", this.element.getAttribute("aria-label") || "Image comparison slider");
      }
    }
    onKeyDown(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        this.stopInertia();
        const target = collapseToggle(this.position, this.restorePosition);
        if (this.position !== 0) this.restorePosition = this.position;
        this.setPosition(target);
        return;
      }
      const next = keyboardStep(this.position, e.key, this.options.step, this.options.pageStep);
      if (next === null) return;
      e.preventDefault();
      this.stopInertia();
      this.setPosition(next);
    }
    /** Double-click or double-tap snaps to the nearest extreme (0 or 100). */
    snapToExtreme() {
      this.stopInertia();
      this.setPosition(nearestExtreme(this.position));
    }
    /** Convert a client coordinate to a 0-100 position along the slider axis. */
    positionFromEvent(e) {
      const rect = this.element.getBoundingClientRect();
      if (this.options.vertical) {
        return clamp((e.clientY - rect.top) / rect.height * 100, 0, 100);
      }
      return clamp((e.clientX - rect.left) / rect.width * 100, 0, 100);
    }
    onPointerDown(e) {
      this.stopInertia();
      this.dragging = true;
      this.pointerId = e.pointerId;
      this.samples = [];
      if (this.dragTarget.setPointerCapture) this.dragTarget.setPointerCapture(e.pointerId);
      this.dragTarget.addEventListener("pointermove", this.onPointerMove);
      this.dragTarget.addEventListener("pointerup", this.onPointerUp);
      this.dragTarget.addEventListener("pointercancel", this.onPointerCancel);
      const pos = this.positionFromEvent(e);
      this.pressPosition = pos;
      this.pushSample(pos);
      this.setPosition(pos);
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
      const now = performance.now();
      const movedBy = Math.abs(this.position - this.pressPosition);
      if (isDoubleTap(now, this.lastTapAt, movedBy)) {
        this.lastTapAt = 0;
        this.snapToExtreme();
        return;
      }
      this.lastTapAt = movedBy > TAP_SLOP ? 0 : now;
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
      this.lastTapAt = 0;
      this.endDrag(e);
    }
    /** Tear down a drag, however it ended. */
    endDrag(e) {
      this.dragging = false;
      this.dragTarget.removeEventListener("pointermove", this.onPointerMove);
      this.dragTarget.removeEventListener("pointerup", this.onPointerUp);
      this.dragTarget.removeEventListener("pointercancel", this.onPointerCancel);
      if (this.dragTarget.releasePointerCapture) {
        try {
          this.dragTarget.releasePointerCapture(e.pointerId);
        } catch {
        }
      }
      this.pointerId = null;
    }
    pushSample(pos) {
      this.samples.push({ t: performance.now(), pos });
      if (this.samples.length > 10) this.samples.shift();
    }
    startInertia() {
      this.stopInertia();
      this.lastFrameTime = performance.now();
      const step = (now) => {
        const dt = now - this.lastFrameTime;
        this.lastFrameTime = now;
        let next = this.position + this.velocity * dt;
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
        if (Math.abs(this.velocity) < 5e-4) {
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
      this.element.style.setProperty("--compare-images-slider-position", this.position + "%");
      const rounded = Math.round(this.position);
      this.handle.setAttribute("aria-valuenow", String(rounded));
      this.handle.setAttribute("aria-valuetext", rounded + "%");
    }
    destroy() {
      this.stopInertia();
      this.element.style.removeProperty("--compare-images-slider-position");
      this.dragTarget.removeEventListener("pointerdown", this.onPointerDown);
      this.dragTarget.removeEventListener("pointermove", this.onPointerMove);
      this.dragTarget.removeEventListener("pointerup", this.onPointerUp);
      this.dragTarget.removeEventListener("pointercancel", this.onPointerCancel);
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
      if (this.slider || !this.querySelector(".frame") || !this.querySelector(".handle")) return;
      this.slider = new CompareImagesSlider(this);
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
