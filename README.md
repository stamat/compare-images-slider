# ↔️ Compare Images Slider [![npm version](https://img.shields.io/npm/v/compare-images-slider)](https://www.npmjs.com/package/compare-images-slider) [![license mit](https://img.shields.io/badge/license-MIT-green)](https://github.com/stamat/compare-images-slider/blob/main/LICENSE)

A simple slider for comparing two images visually.

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

Coming soon...

## TODO:

- [ ] Add options
- [ ] Scroll block on drag
- [ ] Vertical option
- [ ] Add factory class, migrate the general factory class to the book of spells prior to that
- [ ] Refactor onDrag and move it to the book of spells
- [ ] Add initialized state, don't initialize twice

---

Made with ❤️ by @stamat.
