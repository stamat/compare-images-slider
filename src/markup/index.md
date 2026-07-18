---
layout: default
---
<div class="github-buttons">
  <a class="github-button" href="https://github.com/stamat/compare-images-slider" data-size="large" aria-label="Download stamat/compare-images-slider on GitHub">View on GitHub</a>
</div>


<h1 class="mb-0 mt-lg-128 mt-80">{{ site.title }}</h1>
<p class="p1 mb-64 mt-16 text-gray">{{ site.description }}</p>

<div class="js-compare-images-slider compare-images-slider">
  <img width="1680" height="1120" src="https://i.imgur.com/Ju4pEb7.jpeg" loading="lazy" alt="Building, before edit">
  <div class="frame">
    <img width="1680" height="1120" src="https://i.imgur.com/pvWyCKw.jpeg" loading="lazy" alt="Building, after edit">
  </div>
  <span class="handle"></span>
</div>

<p class="text-gray text-italic">Photo by <a href="https://unsplash.com/@necone?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Nenad Radojčić</a> on <a href="https://unsplash.com/photos/gray-concrete-building-under-white-sky-during-daytime-JBm5eNo6B4E?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>. Drag the handle, or focus it and use the arrow keys.</p>

<div class="markdown-body">

## Overview

**Compare Images Slider** overlays two images and reveals one over the other as
you drag a handle across them. It is lightweight, dependency-free, mobile
friendly, and works as either a class you instantiate or a `<compare-images-slider>`
custom element. Because it uses no shadow DOM, every part stays yours to style.

## Usage

Drop in the markup and instantiate the slider on it. Set the intrinsic
`width`/`height` on the images so the layout does not shift while they load.

```html
<div class="js-compare-images-slider compare-images-slider">
  <img width="1680" height="1120" src="before.jpg" alt="Before">
  <div class="frame">
    <img width="1680" height="1120" src="after.jpg" alt="After">
  </div>
  <span class="handle"></span>
</div>
```

```javascript
import CompareImagesSlider from 'compare-images-slider';

const el = document.querySelector('.js-compare-images-slider');
new CompareImagesSlider(el, { inertia: true });
```

Loading the bundle asynchronously? Wait for the `CompareImagesSliderLoaded`
event before instantiating:

```javascript
document.addEventListener('CompareImagesSliderLoaded', () => {
  const el = document.querySelector('.js-compare-images-slider');
  new CompareImagesSlider(el, { inertia: true });
});
```

## Custom element

For the same markup wrapped in a `<compare-images-slider>` tag, no JavaScript
call is needed — the element upgrades itself on connect. Options are read from
attributes (bare, `data-*`, or kebab-case):

```html
<compare-images-slider inertia initial-position="35">
  <img width="1680" height="1120" src="before.jpg" alt="Before">
  <div class="frame">
    <img width="1680" height="1120" src="after.jpg" alt="After">
  </div>
  <span class="handle"></span>
</compare-images-slider>
```

## Vertical

Add the `vertical` attribute (or pass `{ vertical: true }`) to split top and
bottom instead of left and right.

```html
<div class="js-compare-images-slider compare-images-slider" vertical>
  <!-- ...same inner markup... -->
</div>
```

</div>

<div class="js-compare-images-slider compare-images-slider" vertical>
  <img width="1680" height="1120" src="https://i.imgur.com/VWdIu81.jpeg" loading="lazy" alt="Tree, before edit">
  <div class="frame">
    <img width="1680" height="1120" src="https://i.imgur.com/C7zhEkz.jpeg" loading="lazy" alt="Tree, after edit">
  </div>
  <span class="handle"></span>
</div>

<p class="text-gray text-italic">Photo by <a href="https://unsplash.com/@valentinsalja?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Valentin Salja</a> on <a href="https://unsplash.com/photos/withered-tree-covered-in-snow-AqcD0Q1JLpE?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a></p>

<div class="markdown-body">

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `inertia` | boolean | `false` | Keep gliding after a flick. |
| `bounce` | boolean | `false` | Bounce off the edges while under inertia. |
| `friction` | number | `0.9` | Inertia decay per frame (0–1). |
| `bounceFactor` | number | `0.1` | Energy kept on a bounce (0–1). |
| `maxFlickVelocity` | number | `0.5` | Cap on flick velocity (% per ms). |
| `onlyHandle` | boolean | `true` | Only the handle starts a drag. |
| `vertical` | boolean | `false` | Split top/bottom instead of left/right. |
| `initialPosition` | number | `50` | Starting position (0–100). |
| `step` | number | `5` | Arrow-key step (percent). |
| `pageStep` | number | `25` | Page Up/Down step (percent). |

> **Note:** Set the intrinsic dimensions of the images. This eliminates layout
> shifts and ensures the slider measures correctly on load.

## Flick physics

Quick flicks used to shoot straight to the edges. Velocity is now sampled over a
short time window instead of a single frame and capped, so a fast flick carries
naturally without slamming to an extreme. Friction is applied frame-rate
independently, so the feel is consistent across displays.

## Accessibility

The handle follows the W3C APG
[Window Splitter pattern](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/):
it is a focusable `role="separator"` exposing `aria-valuenow`, `aria-valuemin`,
`aria-valuemax`, and `aria-orientation`, wired to the revealed pane via
`aria-controls`. Once focused it is fully keyboard operable:

| Key | Action |
| --- | --- |
| <kbd>Left</kbd> / <kbd>Up</kbd> | Move by one step |
| <kbd>Right</kbd> / <kbd>Down</kbd> | Move by one step the other way |
| <kbd>Page Up</kbd> / <kbd>Page Down</kbd> | Move by a larger step |
| <kbd>Home</kbd> / <kbd>End</kbd> | Jump to either extreme |
| Double-click | Snap to the nearest extreme |

## Styling

There is no shadow DOM, so the element and its children are styled directly. The
reveal position is exposed as a CSS custom property:

```css
compare-images-slider {
  --compare-images-slider-initial-position: 35%;
}
```

</div>

<script>
  const sliders = document.querySelectorAll('.js-compare-images-slider');
  const options = {
    inertia: true
  }

  function init() {
    for (let i = 0; i < sliders.length; i++) {
      new CompareImagesSlider(sliders[i], options);
    }
  }

  if (window.CompareImagesSlider) {
    init();
  } else {
    document.addEventListener('CompareImagesSliderLoaded', init);
  }
</script>

<div class="my-64 text-right text-gray text-italic">
Made with ❤️ by <a href="https://github.com/stamat">@stamat</a>.
</div>
