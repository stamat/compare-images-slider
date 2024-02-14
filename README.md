# ↔️ Compare Images Slider [![npm version](https://img.shields.io/npm/v/compare-images-slider)](https://www.npmjs.com/package/compare-images-slider) [![license mit](https://img.shields.io/badge/license-MIT-green)](https://github.com/stamat/compare-images-slider/blob/main/LICENSE)

A simple slider for comparing two images visually.

![Screenshot](https://imgur.com/e9m4QaU)

## Features

- Lightweight and minimal DOM depth
- No dependencies
- Mobile friendly
- Vertical slider
- Inertia physics
- Bounce back
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
<link rel="stylesheet" href="https://unpkg.com/compare-images-slider/dist/compare-images-slider.min.css">
```

## Usage

```html
<div class="js-compare-images-slider compare-images-slider">
  <img src="img.jpg" alt="">
  <div class="frame">
    <img src="img-alt.jpg" alt="">
  </div>
  <span class="handle"></span>
</div>
```

**⚠️ Note:** Don't be lazy and please set the intrinsic dimensions of the images. This eliminates layout shifts and will ensure the slider works as expected.

```javascript
import CompareImagesSlider from 'compare-images-slider';

const slider = document.querySelector('.js-compare-images-slider');
const compareImagesSlider = new CompareImagesSlider(slider);
```

If you are loading the script asynchronously, you can listen for the `CompareImagesSliderLoaded` event to initialize the slider:

```javascript
document.addEventListener('CompareImagesSliderLoaded', function() {
  const slider = document.querySelector('.js-compare-images-slider');
  const compareImagesSlider = new CompareImagesSlider(slider);
});
```

```scss
@import 'node_modules/compare-images-slider/src/styles/index.scss';
```

## Options

```javascript
// Default options
const options = {
  inertia: false, // inertia physics, you can flick the handle
  friction: 0.9, // the friction of the inertia
  bounce: false, // will bounce back when intertia is enabled and the boundary is reached
  bounceFactor: 0.1, // the force of the bounce
  vertical: false // vertical slider
  onlyHandle: true // only the handle is draggable
}

new CompareImagesSlider(slider, options);
```

## TODO:

- [x] Add options
- [x] Scroll block on drag
- [x] Vertical option
- [ ] Add factory class, migrate the general factory class to the book of spells prior to that? Better turn this into custom element!
- [x] Refactor onDrag and move it to the book of spells
- [ ] Add initialized state, don't initialize twice

---

Made with ❤️ by @stamat.
