/* compare-images-slider v1.0.1 | https://stamat.github.io/compare-images-slider/ | MIT License */
(() => {
  // node_modules/book-of-spells/src/helpers.mjs
  function shallowMerge(target, source) {
    for (const key in source) {
      target[key] = source[key];
    }
    return target;
  }
  function isObject(o) {
    return typeof o === "object" && !Array.isArray(o) && o !== null;
  }
  function isFunction(o) {
    return typeof o === "function";
  }
  function percentage(num, total) {
    if (!num || !total || Number.isNaN(num) || Number.isNaN(total))
      return 0;
    return num / total * 100;
  }

  // node_modules/book-of-spells/src/dom.mjs
  function drag(element, opts) {
    if (!element || !(element instanceof Element))
      return;
    if (element.getAttribute("drag-enabled") === "true")
      return;
    let x = 0;
    let y = 0;
    let prevX = 0;
    let prevY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let dragging = false;
    let rect = null;
    let inertiaId = null;
    const options = {
      inertia: false,
      bounce: false,
      friction: 0.9,
      bounceFactor: 0.2,
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
    element.setAttribute("drag-enabled", "true");
    element.setAttribute("dragging", "false");
    const calcPageRelativeRect = function() {
      const origRect = element.getBoundingClientRect();
      const rect2 = {
        top: origRect.top + window.scrollY,
        left: origRect.left + window.scrollX,
        width: origRect.width,
        height: origRect.height
      };
      return rect2;
    };
    rect = calcPageRelativeRect();
    const handleStart = function(e) {
      setXY(e);
      dragging = true;
      rect = calcPageRelativeRect();
      element.setAttribute("dragging", "true");
      if (inertiaId) {
        cancelAnimationFrame(inertiaId);
        inertiaId = null;
      }
      const event = new CustomEvent("dragstart", { detail: getDetail() });
      element.dispatchEvent(event);
    };
    const handleMove = function(e) {
      if (!dragging)
        return;
      setXY(e);
      velocityX = x - prevX;
      velocityY = y - prevY;
      const detail = getDetail();
      if (options.callback)
        options.callback(detail);
      const event = new CustomEvent("drag", { detail });
      element.dispatchEvent(event);
    };
    const handleEnd = function() {
      dragging = false;
      element.setAttribute("dragging", "false");
      if (options.inertia)
        inertiaId = requestAnimationFrame(inertia);
      const event = new CustomEvent("dragend", { detail: getDetail() });
      element.dispatchEvent(event);
    };
    const setXY = function(e) {
      const carrier = e.touches ? e.touches[0] : e;
      if (e.touches && options.preventDefaultTouch)
        e.preventDefault();
      prevX = x;
      prevY = y;
      x = carrier.pageX;
      y = carrier.pageY;
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
        relativeX,
        relativeY,
        xPercentage,
        yPercentage,
        velocityX,
        velocityY,
        prevX,
        prevY
      };
      if (xPercentage < 0)
        detail.xPercentage = 0;
      if (xPercentage > 100)
        detail.xPercentage = 100;
      if (yPercentage < 0)
        detail.yPercentage = 0;
      if (yPercentage > 100)
        detail.yPercentage = 100;
      return detail;
    };
    const inertia = function() {
      x += velocityX;
      y += velocityY;
      velocityX *= options.friction;
      velocityY *= options.friction;
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
      if (Math.abs(velocityX) < 0.1)
        velocityX = 0;
      if (Math.abs(velocityY) < 0.1)
        velocityY = 0;
      const detail = getDetail();
      if (velocityX !== 0 || velocityY !== 0) {
        if (options.callback)
          options.callback(detail);
        const event = new CustomEvent("draginertia", { detail });
        element.dispatchEvent(event);
        inertiaId = requestAnimationFrame(inertia);
      } else {
        inertiaId = null;
        if (options.callback)
          options.callback(detail);
        const event = new CustomEvent("draginertiaend", { detail });
        element.dispatchEvent(event);
      }
    };
    element.addEventListener("mousedown", handleStart);
    element.addEventListener("mousemove", handleMove);
    element.addEventListener("mouseup", handleEnd);
    element.addEventListener("touchstart", handleStart);
    element.addEventListener("touchmove", handleMove);
    element.addEventListener("touchend", handleEnd);
    return {
      destroy: function() {
        element.removeEventListener("mousedown", handleStart);
        element.removeEventListener("mousemove", handleMove);
        element.removeEventListener("mouseup", handleEnd);
        element.removeEventListener("touchstart", handleStart);
        element.removeEventListener("touchmove", handleMove);
        element.removeEventListener("touchend", handleEnd);
        if (inertiaId) {
          cancelAnimationFrame(inertiaId);
          inertiaId = null;
        }
      }
    };
  }

  // src/scripts/compare-images-slider.js
  var CompareImagesSlider = class {
    constructor(element, options) {
      this.element = element;
      this.frame = this.element.querySelector(".frame");
      this.second = this.frame.querySelector(":scope > img");
      this.handle = this.element.querySelector(".handle");
      this.options = {
        inertia: false,
        bounce: false,
        friction: 0.9,
        bounceFactor: 0.1,
        onlyHandle: true,
        vertical: false
      };
      if (options)
        shallowMerge(this.options, options);
      this.checkAndApplyAttribute("vertical");
      if (this.options.vertical && !(this.element.dataset.vertical || this.element.hasAttribute("vertical")))
        this.element.setAttribute("vertical", "");
      if (this.options.onlyHandle)
        this.options.preventDefaultTouch = false;
      window.addEventListener("resize", () => {
        requestAnimationFrame(this.setupSecondImage.bind(this));
      });
      this.setupSecondImage();
      this.drag = drag(this.element, this.options);
      this.handleDragBound = false;
      this.boundUpdateVisibleHandler = this.updateVisibleHandler.bind(this);
      const preventDefault = (e) => {
        if (this.handleDragBound)
          e.preventDefault();
      };
      const addEventListeners = () => {
        if (this.handleDragBound)
          return;
        this.handleDragBound = true;
        this.element.addEventListener("dragstart", this.boundUpdateVisibleHandler);
        this.element.addEventListener("drag", this.boundUpdateVisibleHandler);
        this.element.addEventListener("draginertia", this.boundUpdateVisibleHandler);
        this.element.addEventListener("draginertiaend", () => {
          this.element.removeEventListener("draginertia", this.boundUpdateVisibleHandler);
        });
        this.element.addEventListener("touchstart", preventDefault);
      };
      const removeEventListeners = () => {
        if (!this.handleDragBound)
          return;
        this.handleDragBound = false;
        this.element.removeEventListener("dragstart", this.boundUpdateVisibleHandler);
        this.element.removeEventListener("drag", this.boundUpdateVisibleHandler);
        this.element.removeEventListener("touchstart", preventDefault);
      };
      if (this.options.onlyHandle) {
        this.handle.addEventListener("mousedown", addEventListeners);
        this.handle.addEventListener("touchstart", addEventListeners);
        document.addEventListener("mouseup", removeEventListeners);
        document.addEventListener("touchend", removeEventListeners);
      } else {
        this.element.addEventListener("dragstart", this.boundUpdateVisibleHandler);
        this.element.addEventListener("drag", this.boundUpdateVisibleHandler);
        this.element.addEventListener("draginertia", this.boundUpdateVisibleHandler);
      }
    }
    checkAndApplyAttribute(attribute) {
      if (this.element.dataset[attribute] || this.element.hasAttribute(attribute))
        this.options[attribute] = true;
    }
    setupSecondImage() {
      const width = this.element.offsetWidth + "px";
      this.second.style.width = width;
    }
    updateVisibleHandler(e) {
      if (this.options.vertical) {
        this.frame.style.height = e.detail.yPercentage + "%";
        this.handle.style.top = e.detail.yPercentage + "%";
        return;
      }
      this.frame.style.width = e.detail.xPercentage + "%";
      this.handle.style.left = e.detail.xPercentage + "%";
    }
    destroy() {
      this.drag.destroy();
      this.element.removeEventListener("dragstart", this.boundUpdateVisibleHandler);
      this.element.removeEventListener("drag", this.boundUpdateVisibleHandler);
      this.element.removeEventListener("draginertia", this.boundUpdateVisibleHandler);
    }
  };

  // src/scripts/iife.js
  if (!window.CompareImagesSlider) {
    window.CompareImagesSlider = CompareImagesSlider;
    document.dispatchEvent(new CustomEvent("CompareImagesSliderLoaded"));
  }
})();
//# sourceMappingURL=compare-images-slider.js.map
