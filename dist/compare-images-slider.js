/* compare-images-slider v1.0.2 | https://stamat.github.io/compare-images-slider/ | MIT License */
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
      this.second = this.frame.querySelector(":scope > img");
      this.handle = this.element.querySelector(".handle");
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
      this.checkAndApplyAttribute("vertical");
      this.checkAndApplyNumberAttribute("initialPosition", "initial-position");
      if (this.options.vertical && !(this.element.dataset.vertical || this.element.hasAttribute("vertical"))) {
        this.element.setAttribute("vertical", "");
      }
      this.position = clamp(this.options.initialPosition, 0, 100);
      this.dragging = false;
      this.pointerId = null;
      this.samples = [];
      this.velocity = 0;
      this.inertiaId = null;
      this.lastFrameTime = 0;
      this.onPointerDown = this.onPointerDown.bind(this);
      this.onPointerMove = this.onPointerMove.bind(this);
      this.onPointerUp = this.onPointerUp.bind(this);
      this.onResize = () => requestAnimationFrame(this.setupSecondImage.bind(this));
      this.onKeyDown = this.onKeyDown.bind(this);
      this.onDoubleClick = this.onDoubleClick.bind(this);
      window.addEventListener("resize", this.onResize);
      this.setupSecondImage();
      this.setupAccessibility();
      this.dragTarget = this.options.onlyHandle ? this.handle : this.element;
      this.dragTarget.addEventListener("pointerdown", this.onPointerDown);
      this.handle.addEventListener("keydown", this.onKeyDown);
      this.handle.addEventListener("dblclick", this.onDoubleClick);
      this.render();
    }
    /**
     * Wire up the W3C APG Window Splitter pattern on the handle:
     * a focusable role="separator" reporting its position via ARIA.
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
    checkAndApplyAttribute(attribute) {
      if (this.element.dataset[attribute] || this.element.hasAttribute(attribute)) this.options[attribute] = true;
    }
    /** Read a numeric option from a `data-*` or bare attribute if present. */
    checkAndApplyNumberAttribute(optionKey, attribute) {
      const raw = this.element.dataset[optionKey] != null ? this.element.dataset[optionKey] : this.element.getAttribute(attribute);
      if (raw == null || raw === "") return;
      const num = parseFloat(raw);
      if (!Number.isNaN(num)) this.options[optionKey] = num;
    }
    setupSecondImage() {
      this.second.style.width = this.element.offsetWidth + "px";
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
      this.dragTarget.addEventListener("pointercancel", this.onPointerUp);
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
      this.dragTarget.removeEventListener("pointermove", this.onPointerMove);
      this.dragTarget.removeEventListener("pointerup", this.onPointerUp);
      this.dragTarget.removeEventListener("pointercancel", this.onPointerUp);
      if (this.dragTarget.releasePointerCapture) {
        try {
          this.dragTarget.releasePointerCapture(e.pointerId);
        } catch {
        }
      }
      this.pointerId = null;
      if (this.options.inertia) {
        this.velocity = capVelocity(sampleVelocity(this.samples), this.options.maxFlickVelocity);
        if (Math.abs(this.velocity) > 0) this.startInertia();
      }
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
      const value = this.position + "%";
      if (this.options.vertical) {
        this.frame.style.height = value;
        this.handle.style.top = value;
      } else {
        this.frame.style.width = value;
        this.handle.style.left = value;
      }
      const rounded = Math.round(this.position);
      this.handle.setAttribute("aria-valuenow", String(rounded));
      this.handle.setAttribute("aria-valuetext", rounded + "%");
    }
    destroy() {
      this.stopInertia();
      window.removeEventListener("resize", this.onResize);
      this.dragTarget.removeEventListener("pointerdown", this.onPointerDown);
      this.dragTarget.removeEventListener("pointermove", this.onPointerMove);
      this.dragTarget.removeEventListener("pointerup", this.onPointerUp);
      this.dragTarget.removeEventListener("pointercancel", this.onPointerUp);
      this.handle.removeEventListener("keydown", this.onKeyDown);
      this.handle.removeEventListener("dblclick", this.onDoubleClick);
    }
  };
  var BOOL_OPTIONS = ["inertia", "bounce", "vertical", "onlyHandle"];
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
  var ElementBase = typeof HTMLElement !== "undefined" ? HTMLElement : class {
  };
  var CompareImagesSliderElement = class extends ElementBase {
    connectedCallback() {
      if (this.slider || !this.querySelector(".frame") || !this.querySelector(".handle")) return;
      this.slider = new CompareImagesSlider(this, readOptionsFromElement(this));
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
