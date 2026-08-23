# ↔️ Compare Images Slider [![npm version](https://img.shields.io/npm/v/compare-images-slider)](https://www.npmjs.com/package/compare-images-slider) [![license mit](https://img.shields.io/badge/license-MIT-green)](https://github.com/stamat/compare-images-slider/blob/main/LICENSE)

A simple slider for comparing two images visually.

<img style="max-width: 100%" src="https://i.imgur.com/e9m4QaU.jpeg" alt="Compare Images Slider Screenshot">

## Features

- Lightweight
- Minimal DOM depth
- No dependencies
- Mobile friendly
- Vertical slider
- Inertia physics with capped, natural-feeling flicks
- Bounce back
- Keyboard accessible ([W3C APG Window Splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/))
- Custom element, no shadow DOM
- Customizable via CSS

## Demo

[Check out the demo](https://stamat.github.io/compare-images-slider/)

## Installation

```bash
npm install compare-images-slider
```

or use the CDN:

```html
<script src="https://unpkg.com/compare-images-slider/dist/compare-images-slider.min.js"></script>
<link
  rel="stylesheet"
  href="https://unpkg.com/compare-images-slider/dist/compare-images-slider.min.css"
/>
```

## Usage

```html
<div class="js-compare-images-slider compare-images-slider">
  <img src="img.jpg" alt="" />
  <div class="frame">
    <img src="img-alt.jpg" alt="" />
  </div>
  <span class="handle"></span>
</div>
```

**⚠️ Note:** Don't be lazy and please set the intrinsic dimensions of the images. This eliminates layout shifts and will ensure the slider works as expected.

```javascript
import CompareImagesSlider from "compare-images-slider";

const slider = document.querySelector(".js-compare-images-slider");
const compareImagesSlider = new CompareImagesSlider(slider);
```

If you are loading the script asynchronously, you can listen for the `CompareImagesSliderLoaded` event to initialize the slider:

```javascript
document.addEventListener("CompareImagesSliderLoaded", function () {
  const slider = document.querySelector(".js-compare-images-slider");
  const compareImagesSlider = new CompareImagesSlider(slider);
});
```

```scss
@import "node_modules/compare-images-slider/src/styles/index.scss";
```

## Custom element

The same markup wrapped in a `<compare-images-slider>` tag upgrades itself — no
JavaScript call needed. It uses light DOM (no shadow root), so the images, frame
and handle stay fully stylable. Options are read from attributes (bare, `data-*`
or kebab-case):

```html
<compare-images-slider inertia initial-position="35">
  <img src="img.jpg" alt="" />
  <div class="frame">
    <img src="img-alt.jpg" alt="" />
  </div>
  <span class="handle"></span>
</compare-images-slider>
```

The package ships a
[Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest)
at `dist/custom-elements.json`, pointed at by the `customElements` key — every
attribute and custom property above, described once in the JSDoc block on
`CompareImagesSliderElement` and generated from it by
[`cem analyze`](https://custom-elements-manifest.open-wc.org/analyzer/getting-started/).
That is what buys editor autocomplete on the tag, and a tool a description of
this element it did not have to be told by hand.

## Accessibility

The handle is a focusable `role="separator"` implementing the
[W3C APG Window Splitter pattern](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/)
with `aria-valuenow`/`min`/`max`, `aria-orientation` and `aria-controls`. Once
focused: arrow keys move by `step`, Page Up/Down by `pageStep`, Home/End jump to
the extremes, and double-click snaps to the nearest extreme.

## Options

```javascript
// Default options
const options = {
  inertia: false, // inertia physics, you can flick the handle
  friction: 0.9, // the friction of the inertia
  bounce: false, // will bounce back when inertia is enabled and the boundary is reached
  bounceFactor: 0.1, // the force of the bounce
  maxFlickVelocity: 0.5, // cap on flick velocity (% per ms), tames hard flicks
  vertical: false, // vertical slider
  onlyHandle: true, // only the handle is draggable
  initialPosition: 50, // starting position (0-100)
  step: 5, // arrow-key step (percent)
  pageStep: 25, // Page Up/Down step (percent)
};

new CompareImagesSlider(slider, options);
```

Available attribute options (bare, `data-*` or kebab-case):

- `vertical` - vertical slider
- `inertia`, `bounce`, `only-handle` - booleans
- `friction`, `bounce-factor`, `max-flick-velocity`, `initial-position`, `step`, `page-step` - numbers

```html
<div class="js-compare-images-slider compare-images-slider" vertical>
  <img src="img.jpg" alt="" />
  <div class="frame">
    <img src="img-alt.jpg" alt="" />
  </div>
  <span class="handle"></span>
</div>
```

## Development

```bash
npm install
npm test   # unit tests (node:test)
npm run lint
npm run build
```

---

Made with ❤️ by @stamat.
