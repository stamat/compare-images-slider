---
layout: poops-docs-theme/prose
title: Before/after image comparison web component
jsonld:
  "@type": SoftwareSourceCode
  name: compare-images-slider
  codeRepository: https://github.com/stamat/compare-images-slider
  programmingLanguage: JavaScript
  runtimePlatform: Browser
  license: https://opensource.org/licenses/MIT
  author:
    "@type": Person
    name: Nikola Stamatovic
og:
  "og:image:alt": The compare-images-slider wordmark over a split photo of a concrete monument, one half flat orange and purple, the other half as shot
---

# Compare Images Slider

A dependency-free before/after image comparison slider — a custom element or a
class you instantiate, with no shadow DOM to fight.

<compare-images-slider inertia>
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

_A live `<compare-images-slider>`, upgraded on connect with no JavaScript instantiation. Photo by [Nenad Radojčić](https://unsplash.com/@necone?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash) on [Unsplash](https://unsplash.com/photos/gray-concrete-building-under-white-sky-during-daytime-JBm5eNo6B4E?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash). Drag the handle, or focus it and use the arrow keys._

## Overview

**Compare Images Slider** overlays two images and reveals one over the other as
you drag a handle across them. It is lightweight, dependency-free, mobile
friendly, and works as a `<compare-images-slider>` custom element or as a class
you instantiate. Because it uses no shadow DOM, every part stays yours to style.

## Usage

Drop in the markup and the tag upgrades itself on connect — no JavaScript call
needed. Options are read from attributes (bare, `data-*`, or kebab-case). Set the
intrinsic `width`/`height` on the images so the layout does not shift while they
load.

```html
<compare-images-slider inertia initial-position="35">
  <img width="1680" height="1120" src="before.jpg" alt="Before" />
  <div class="frame">
    <img width="1680" height="1120" src="after.jpg" alt="After" />
  </div>
  <span class="handle"></span>
</compare-images-slider>
```

## Without the custom element

The same markup on a plain element works too — give it the `compare-images-slider`
class for the styles, and instantiate the slider on it yourself. That is the path
for markup whose tag name is not yours to choose, or a slider built after load.

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

_The same slider as a `div`, instantiated by hand — same markup, same behaviour._

## Vertical

Add the `vertical` attribute (or pass `{ vertical: true }`) to split top and
bottom instead of left and right.

```html
<compare-images-slider vertical>
  <!-- ...same inner markup... -->
</compare-images-slider>
```

<compare-images-slider vertical inertia>
  <img width="1680" height="1120" src="https://i.imgur.com/VWdIu81.jpeg" loading="lazy" alt="Tree, before edit">
  <div class="frame">
    <img width="1680" height="1120" src="https://i.imgur.com/C7zhEkz.jpeg" loading="lazy" alt="Tree, after edit">
  </div>
  <span class="handle">
    <span class="handle-knob">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path d="M3.72 3.72a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.56 7h10.88l-2.22-2.22a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018l3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l2.22-2.22H2.56l2.22 2.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215l-3.5-3.5a.75.75 0 0 1 0-1.06Z"></path></svg>
    </span>
  </span>
</compare-images-slider>

_Photo by [Valentin Salja](https://unsplash.com/@valentinsalja?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash) on [Unsplash](https://unsplash.com/photos/withered-tree-covered-in-snow-AqcD0Q1JLpE?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash)._

## Options

| Option             | Type    | Default | Description                               |
| ------------------ | ------- | ------- | ----------------------------------------- |
| `inertia`          | boolean | `false` | Keep gliding after a flick.               |
| `bounce`           | boolean | `false` | Bounce off the edges while under inertia. |
| `friction`         | number  | `0.9`   | Inertia decay per frame (0–1).            |
| `bounceFactor`     | number  | `0.1`   | Energy kept on a bounce (0–1).            |
| `maxFlickVelocity` | number  | `0.5`   | Cap on flick velocity (% per ms).         |
| `dragAnywhere`     | boolean | `false` | A press anywhere on the images drags.     |
| `vertical`         | boolean | `false` | Split top/bottom instead of left/right.   |
| `initialPosition`  | number  | `50`    | Starting position (0–100).                |
| `step`             | number  | `5`     | Arrow-key step (percent).                 |
| `pageStep`         | number  | `25`    | Page Up/Down step (percent).              |

Each one is an attribute in kebab-case - bare, or `data-` prefixed - and the same
name in camelCase on the options object, read whether you write
`<compare-images-slider>` or call the constructor yourself. An attribute beats the
options object, and a boolean is turned off with `="false"`.

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

<!-- The frame's padding is where the handle knob's overhanging half lands at either
extreme; `$frame-pad` in `src/styles/prose.scss` is the same 6%, and the frame's height
is derived from it. Change one and change the other, or the sample scrolls inside. -->
<code-preview css="{{ relativePathPrefix }}dist/compare-images-slider.min.css" js="{{ relativePathPrefix }}dist/compare-images-slider.min.js" manifest="{{ relativePathPrefix }}dist/custom-elements.json" theme-attribute="data-theme" head="&lt;style&gt;body{margin:0;padding:6%}&lt;/style&gt;">

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
library's own `↔` glyph rather than the svg knob this page draws over it. That knob is
the [optional theme](#optional-theme) plus a span in this page's markup — both shipped,
neither loaded in the frame.

## Flick physics

Quick flicks used to shoot straight to the edges. Velocity is now sampled over a
short time window instead of a single frame and capped, so a fast flick carries
naturally without slamming to an extreme. Friction is applied frame-rate
independently, so the feel is consistent across displays.

## Accessibility

The handle follows the W3C APG
[Window Splitter pattern](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/):
it is a focusable `role="separator"` exposing `aria-valuenow`, `aria-valuemin`,
`aria-valuemax`, and `aria-orientation`, carrying an accessible name, and wired to
the revealed pane — the pattern's primary pane — via `aria-controls`. Once focused
it is fully keyboard operable. Which keys the pattern asks for and which are this
library's own:

| Key                                       | Action                                            | From the pattern? |
| ----------------------------------------- | ------------------------------------------------- | ----------------- |
| <kbd>Left</kbd> / <kbd>Up</kbd>           | Move back by one `step`                           | Yes               |
| <kbd>Right</kbd> / <kbd>Down</kbd>        | Move forward by one `step`                        | Yes               |
| <kbd>Enter</kbd>                          | Collapse the revealed pane, or put it back        | Yes               |
| <kbd>Home</kbd> / <kbd>End</kbd>          | Jump to either extreme                            | Yes, optional     |
| <kbd>Page Up</kbd> / <kbd>Page Down</kbd> | Move by one `pageStep`                            | No, ours          |
| Double-click or double-tap                | Snap to the extreme the handle is further from    | No, ours          |

The pattern's other optional key, <kbd>F6</kbd>, cycles focus between window panes.
There is one pane here and nothing to cycle to, so it is not implemented.

Two details worth knowing before reading the DOM and calling either a bug:

- `aria-orientation` describes the divider, not the layout. A left/right slider has
  a divider running top to bottom, so it reports `vertical`; a `vertical` slider
  reports `horizontal`.
- The arrow keys are a superset of the pattern's. It asks for Left/Right on a
  vertical divider and Up/Down on a horizontal one; both pairs work on both
  orientations here, so a keyboard user who guesses wrong is not stuck.

## Styling

There is no shadow DOM, so the element and its children are styled directly. The
reveal position is exposed as a CSS custom property:

```css
compare-images-slider {
  --compare-images-slider-initial-position: 35%;
}
```

### Optional theme

`compare-images-slider.css` is the slider working — the frame, the handle, the reveal.
The handle it draws is an `↔` glyph in a white circle, and white on black is all it can
be: the stylesheet knows nothing about the page it landed on.

The look done properly is a second file, because a light-DOM element cannot scope a look
away from a page that never asked for one:

```html
<link rel="stylesheet" href="https://unpkg.com/compare-images-slider/dist/compare-images-slider-theme.min.css">
```

```scss
@use "compare-images-slider/src/styles/theme";
```

It paints the handle in `Canvas`/`CanvasText`, the page's own pair — so the knob inverts
with a dark page, and is repainted rather than lost in forced-colors mode — and it takes
an icon of your own from a `.handle-knob` span inside the handle, which is the knob this
page wears:

```html
<span class="handle">
  <span class="handle-knob">
    <svg viewBox="0 0 16 16" width="16" height="16"><!-- your icon --></svg>
  </span>
</span>
```

The knob is markup, so the icon is yours; a handle without one keeps the `↔` glyph,
because every rule in the theme sits behind `:has(.handle-knob)`.

> [!NOTE]
> `Canvas` reads the page's `color-scheme`. A page that themes in custom properties
> without declaring one keeps a light `Canvas` when it goes dark, and the knob goes with
> it. Point the two properties at that page's own tokens instead — two lines, and what
> this page does:
>
> ```css
> compare-images-slider {
>   --compare-images-slider-handle-bg: var(--bg);
>   --compare-images-slider-handle-fg: var(--fg);
> }
> ```

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
