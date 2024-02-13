/* compare-images-slider v1.0.0 | https://stamat.github.io/compare-images-slider/ | MIT License */
(() => {
  // src/scripts/script.js
  var drags = (dragElement, resizeElement, container) => {
    const startDrag = (e) => {
      const startX = e.pageX || e.touches[0].pageX;
      const dragWidth = dragElement.offsetWidth;
      const posX = dragElement.offsetLeft + dragWidth - startX;
      const containerOffset = container.offsetLeft;
      const containerWidth = container.offsetWidth;
      const minLeft = containerOffset + 10;
      const maxLeft = containerOffset + containerWidth - dragWidth - 10;
      const doDrag = (e2) => {
        const moveX = e2.pageX || e2.touches[0].pageX;
        let leftValue = moveX + posX - dragWidth;
        leftValue = Math.max(Math.min(leftValue, maxLeft), minLeft);
        const widthValue = (leftValue + dragWidth / 2 - containerOffset) * 100 / containerWidth + "%";
        dragElement.style.left = widthValue;
        resizeElement.style.width = widthValue;
      };
      const stopDrag = () => {
        dragElement.classList.remove("ba-draggable");
        resizeElement.classList.remove("ba-resizable");
        document.removeEventListener("mousemove", doDrag);
        document.removeEventListener("mouseup", stopDrag);
        document.removeEventListener("touchmove", doDrag);
        document.removeEventListener("touchend", stopDrag);
      };
      dragElement.classList.add("ba-draggable");
      resizeElement.classList.add("ba-resizable");
      document.addEventListener("mousemove", doDrag);
      document.addEventListener("mouseup", stopDrag);
      document.addEventListener("touchmove", doDrag);
      document.addEventListener("touchend", stopDrag);
      e.preventDefault();
    };
    dragElement.addEventListener("mousedown", startDrag);
    dragElement.addEventListener("touchstart", startDrag);
  };
  Element.prototype.beforeAfter = function() {
    const adjustSlider = () => {
      const width = this.offsetWidth + "px";
      this.querySelector(".resize img").style.width = width;
      this.querySelector(".resize .slide").style.width = width;
    };
    adjustSlider();
    drags(this.querySelector(".handle"), this.querySelector(".resize"), this);
    window.addEventListener("resize", adjustSlider);
  };
  document.querySelector(".ba-slider").beforeAfter();
})();
//# sourceMappingURL=script.js.map
