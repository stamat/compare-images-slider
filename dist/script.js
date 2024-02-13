/* compare-images-slider v1.0.0 | https://stamat.github.io/compare-images-slider/ | MIT License */
(() => {
  // node_modules/book-of-spells/src/helpers.mjs
  function percentage(num, total) {
    if (!num || !total || Number.isNaN(num) || Number.isNaN(total))
      return 0;
    return num / total * 100;
  }

  // src/scripts/script.js
  function onDrag(element, callback) {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    let dragging = false;
    let rect = element.getBoundingClientRect();
    const handleStart = function(e) {
      const carrier = e.type === "touchstart" ? e.touches[0] : e;
      startX = carrier.clientX;
      startY = carrier.clientY;
      dragging = true;
      rect = element.getBoundingClientRect();
      const xPercentage = percentage(startX - rect.left, rect.width);
      const yPercentage = percentage(startY - rect.top, rect.height);
      const event = new CustomEvent("dragstart", { detail: { target: element, startX, startY, rect, xPercentage, yPercentage } });
      element.dispatchEvent(event);
    };
    const handleMove = function(e) {
      if (!dragging)
        return;
      const carrier = e.type === "touchmove" ? e.touches[0] : e;
      endX = carrier.clientX;
      endY = carrier.clientY;
      handleDragGesture();
    };
    const handleEnd = function() {
      dragging = false;
      const event = new CustomEvent("dragend", { detail: { target: element, startX, startY, rect, endX, endY } });
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
        deltaX,
        deltaY,
        startX,
        startY,
        endX,
        endY,
        horizontalDirection: left ? "left" : "right",
        verticalDirection: up ? "up" : "down",
        xPercentage,
        yPercentage
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
      const event = new CustomEvent("drag", { detail });
      element.dispatchEvent(event);
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
      }
    };
  }
  var slider = document.querySelector(".ba-slider");
  var initSlider = (slider2) => {
    const secondImage = slider2.querySelector(".resize img");
    const width = slider2.offsetWidth + "px";
    secondImage.style.width = width;
  };
  window.addEventListener("resize", () => {
    requestAnimationFrame(() => {
      initSlider(slider);
    });
  });
  initSlider(slider);
  onDrag(slider);
  updateVisibleHandler = (e) => {
    e.detail.target.querySelector(".resize").style.width = e.detail.xPercentage + "%";
    e.detail.target.querySelector(".handle").style.left = e.detail.xPercentage + "%";
    console.log(e.detail.target.querySelector(".resize"));
  };
  slider.addEventListener("dragstart", (e) => {
    requestAnimationFrame(() => {
      updateVisibleHandler(e);
    });
  });
  slider.addEventListener("drag", (e) => {
    requestAnimationFrame(() => {
      updateVisibleHandler(e);
    });
  });
})();
//# sourceMappingURL=script.js.map
