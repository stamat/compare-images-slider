---
layout: poops-docs-theme/prose
---

# Compare Images Slider

A simple slider for comparing two images visually.

<div class="js-compare-images-slider compare-images-slider">
  <img width="1680" height="1120" src="https://i.imgur.com/Ju4pEb7.jpeg" loading="lazy" alt="Building, before edit">
  <div class="frame">
    <img width="1680" height="1120" src="https://i.imgur.com/pvWyCKw.jpeg" loading="lazy" alt="Building, after edit">
  </div>
  <span class="handle">
    <span class="handle-knob">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path d="M3.72 3.72a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.56 7h10.88l-2.22-2.22a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018l3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l2.22-2.22H2.56l2.22 2.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215l-3.5-3.5a.75.75 0 0 1 0-1.06Z"></path></svg>
    </span>
  </span>
</div>

_Photo by [Nenad Radojčić](https://unsplash.com/@necone?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash) on [Unsplash](https://unsplash.com/photos/gray-concrete-building-under-white-sky-during-daytime-JBm5eNo6B4E?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash). Drag the handle, or focus it and use the arrow keys._

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
  <img width="1680" height="1120" src="before.jpg" alt="Before" />
  <div class="frame">
    <img width="1680" height="1120" src="after.jpg" alt="After" />
  </div>
  <span class="handle"></span>
</div>
```

```javascript
import CompareImagesSlider from "compare-images-slider";

const el = document.querySelector(".js-compare-images-slider");
new CompareImagesSlider(el, { inertia: true });
```

Loading the bundle asynchronously? Wait for the `CompareImagesSliderLoaded`
event before instantiating:

```javascript
document.addEventListener("CompareImagesSliderLoaded", () => {
  const el = document.querySelector(".js-compare-images-slider");
  new CompareImagesSlider(el, { inertia: true });
});
```

## Custom element

For the same markup wrapped in a `<compare-images-slider>` tag, no JavaScript
call is needed — the element upgrades itself on connect. Options are read from
attributes (bare, `data-*`, or kebab-case):

```html
<compare-images-slider inertia initial-position="35">
  <img width="1680" height="1120" src="before.jpg" alt="Before" />
  <div class="frame">
    <img width="1680" height="1120" src="after.jpg" alt="After" />
  </div>
  <span class="handle"></span>
</compare-images-slider>
```

<compare-images-slider inertia initial-position="35">
  <img width="1680" height="1120" src="https://i.imgur.com/Ju4pEb7.jpeg" loading="lazy" alt="Building, before edit">
  <div class="frame">
    <img width="1680" height="1120" src="https://i.imgur.com/pvWyCKw.jpeg" loading="lazy" alt="Building, after edit">
  </div>
  <span class="handle">
    <span class="handle-knob">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path d="M3.72 3.72a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.56 7h10.88l-2.22-2.22a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018l3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l2.22-2.22H2.56l2.22 2.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215l-3.5-3.5a.75.75 0 0 1 0-1.06Z"></path></svg>
    </span>
  </span>
</compare-images-slider>

_A live `<compare-images-slider>` element — it upgrades itself on connect, with no JavaScript instantiation._

## Vertical

Add the `vertical` attribute (or pass `{ vertical: true }`) to split top and
bottom instead of left and right.

```html
<div class="js-compare-images-slider compare-images-slider" vertical>
  <!-- ...same inner markup... -->
</div>
```

<div class="js-compare-images-slider compare-images-slider" vertical>
  <img width="1680" height="1120" src="https://i.imgur.com/VWdIu81.jpeg" loading="lazy" alt="Tree, before edit">
  <div class="frame">
    <img width="1680" height="1120" src="https://i.imgur.com/C7zhEkz.jpeg" loading="lazy" alt="Tree, after edit">
  </div>
  <span class="handle">
    <span class="handle-knob">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path d="M3.72 3.72a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.56 7h10.88l-2.22-2.22a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018l3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l2.22-2.22H2.56l2.22 2.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215l-3.5-3.5a.75.75 0 0 1 0-1.06Z"></path></svg>
    </span>
  </span>
</div>

_Photo by [Valentin Salja](https://unsplash.com/@valentinsalja?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash) on [Unsplash](https://unsplash.com/photos/withered-tree-covered-in-snow-AqcD0Q1JLpE?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash)._

## Options

| Option             | Type    | Default | Description                               |
| ------------------ | ------- | ------- | ----------------------------------------- |
| `inertia`          | boolean | `false` | Keep gliding after a flick.               |
| `bounce`           | boolean | `false` | Bounce off the edges while under inertia. |
| `friction`         | number  | `0.9`   | Inertia decay per frame (0–1).            |
| `bounceFactor`     | number  | `0.1`   | Energy kept on a bounce (0–1).            |
| `maxFlickVelocity` | number  | `0.5`   | Cap on flick velocity (% per ms).         |
| `onlyHandle`       | boolean | `true`  | Only the handle starts a drag.            |
| `vertical`         | boolean | `false` | Split top/bottom instead of left/right.   |
| `initialPosition`  | number  | `50`    | Starting position (0–100).                |
| `step`             | number  | `5`     | Arrow-key step (percent).                 |
| `pageStep`         | number  | `25`    | Page Up/Down step (percent).              |

> [!NOTE]
> Set the intrinsic dimensions of the images. This eliminates layout shifts and
> ensures the slider measures correctly on load.

### Try them

The block below is the sample and the thing it documents at once: the frame above
renders the markup under it, and **Options** is that table again as knobs, built from
the [manifest](https://github.com/webcomponents/custom-elements-manifest) this package
ships. Turning one rewrites the attribute in the code, so what you read is always what
is running.

<link rel="stylesheet" href="{{ relativePathPrefix }}css/code-preview.min.css">
<script src="{{ relativePathPrefix }}js/code-preview-hljs.min.js" defer></script>
<script src="{{ relativePathPrefix }}js/code-preview-options.min.js" defer></script>

<code-preview css="{{ relativePathPrefix }}dist/compare-images-slider.min.css" js="{{ relativePathPrefix }}dist/compare-images-slider.min.js" manifest="{{ relativePathPrefix }}dist/custom-elements.json" theme-attribute="data-theme" style="--code-preview-height: 500px">

```html
<compare-images-slider inertia initial-position="35">
  <img width="1680" height="1120" src="https://i.imgur.com/Ju4pEb7.jpeg" alt="Building, before edit">
  <div class="frame">
    <img width="1680" height="1120" src="https://i.imgur.com/pvWyCKw.jpeg" alt="Building, after edit">
  </div>
  <span class="handle"></span>
</compare-images-slider>
```

</code-preview>

The frame loads only `compare-images-slider.min.css`, so the handle there is the
library's own `↔` glyph rather than the svg knob this page draws over it — that knob is
markup and CSS from the demo, not something the package ships.

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

| Key                                       | Action                         |
| ----------------------------------------- | ------------------------------ |
| <kbd>Left</kbd> / <kbd>Up</kbd>           | Move by one step               |
| <kbd>Right</kbd> / <kbd>Down</kbd>        | Move by one step the other way |
| <kbd>Page Up</kbd> / <kbd>Page Down</kbd> | Move by a larger step          |
| <kbd>Home</kbd> / <kbd>End</kbd>          | Jump to either extreme         |
| Double-click                              | Snap to the nearest extreme    |

## Styling

There is no shadow DOM, so the element and its children are styled directly. The
reveal position is exposed as a CSS custom property:

```css
compare-images-slider {
  --compare-images-slider-initial-position: 35%;
}
```

<script src="{{ relativePathPrefix }}dist/compare-images-slider.min.js"></script>
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
