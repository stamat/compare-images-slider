/* shitstorm v1.0.0 | https://stamat.github.io/shitstorm/ | MIT License */
(() => {
  // node_modules/book-of-spells/src/browser.mjs
  function isUserAgentMobile(str) {
    return /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(str) || /\b(Android|Windows Phone|iPad|iPod)\b/i.test(str);
  }
  function isMobile() {
    if ("maxTouchPoints" in navigator)
      return navigator.maxTouchPoints > 0;
    if ("matchMedia" in window)
      return !!matchMedia("(pointer:coarse)").matches;
    if ("orientation" in window)
      return true;
    return isUserAgentMobile(navigator.userAgent);
  }

  // src/scripts/script.js
  console.log(`hello ${isMobile() ? "mobile" : "desktop"} world!`);
})();
//# sourceMappingURL=script.js.map
