# ↔️ Compare Images Slider [![npm version](https://img.shields.io/npm/v/compare-images-slider)](https://www.npmjs.com/package/compare-images-slider) [![license mit](https://img.shields.io/badge/license-MIT-green)](https://github.com/stamat/compare-images-slider/blob/main/LICENSE)

A before/after comparison slider — two images, two videos, or whatever else you
put in the markup.

<img style="max-width: 100%" src="https://i.imgur.com/e9m4QaU.jpeg" alt="Compare Images Slider Screenshot">

## Features

- Custom element, no shadow DOM
- Lightweight
- Minimal DOM depth
- One dependency, and it is the sibling spellbook: [book-of-spells](https://github.com/stamat/book-of-spells), for the gesture, glide included, and one sum
- Mobile friendly
- Reveals anything — images, video, canvas, your own markup
- Vertical slider
- `input`, `change`, `start` and `end` events
- Inertia physics with capped, natural-feeling flicks
- Bounce back
- Keyboard accessible ([W3C APG Window Splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/))
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

## The one dependency

[book-of-spells](https://github.com/stamat/book-of-spells) is not a third party — it is
the sibling spellbook, where behaviour that ended up in more than one of these packages
lives once instead of being written out again per repository. Two of its spells are
used here, and the gesture is the one
[book-of-elementals](https://github.com/stamat/book-of-elementals) reaches for as well —
the other rides inside it:

| Taken from it | What it does here | Shared with |
| --- | --- | --- |
| [`drag()`](https://stamat.github.io/book-of-spells/module-dom.html#.drag), `src/dom.mjs` | The gesture, both halves: under the pointer, the capture, a `pointercancel` told apart from a release, the moves heard on the document, the client coordinate turned into a percentage of the track; after it, the glide — the flick sampled over a window and capped, the friction, the wall it stops at or bounces off | [`<splitter-elemental>`](https://stamat.github.io/book-of-elementals/elementals/splitter.html) and [`<rearrangeable-elemental>`](https://stamat.github.io/book-of-elementals/elementals/rearrangeable.html) |
| [`clamp()`](https://stamat.github.io/book-of-spells/global.html#clamp), `src/helpers.mjs` | Holds the position to 0–100 under the keys and the collapse | `drag()`, which holds the flick to its ceiling with it |

The flick was written out here as well until it was not — sampled, capped and glided
in two repositories, and neither copy knew when the other was fixed. One thing stays,
because `drag()` cannot know it: the double tap, which is no part of a drag.

## Usage

The `<compare-images-slider>` tag upgrades itself the moment it connects — no
JavaScript call, nothing to register past loading the bundle. It uses light DOM
(no shadow root), so the images, frame and handle stay fully stylable, and every
option is an attribute (bare, `data-*` or kebab-case):

```html
<compare-images-slider inertia initial-position="35">
  <img src="img.jpg" alt="" />
  <div class="frame">
    <img src="img-alt.jpg" alt="" />
  </div>
  <span class="handle"></span>
</compare-images-slider>
```

**⚠️ Note:** Don't be lazy and please set the intrinsic dimensions of the images.
Nothing in the slider measures them — the reveal is clipped by percentage — but
without them the page reflows as they load, which moves the slider out from under
the pointer mid-drag.

The live reveal position is on the element as `--compare-images-slider-position`,
written on every render, so page CSS can sit on the reveal edge without asking the
script for anything. Where it _starts_, before the script has run, is
`--compare-images-slider-initial-position`.

Building with Sass rather than loading the CSS file:

```scss
@use "compare-images-slider/src/styles/index";
```

That is a plain load path into `node_modules`, not the package's `exports` map —
Sass resolves the file, not the subpath. Bundlers and anything that reads
`exports` get the same two stylesheets as `compare-images-slider/style.css` and
`compare-images-slider/theme.css`.

The package ships a
[Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest)
at `dist/custom-elements.json`, pointed at by the `customElements` key — every
attribute below, every event and every `--compare-images-slider-*` custom property,
described once in the JSDoc block on `CompareImagesSliderElement` and generated from it by
[`cem analyze`](https://custom-elements-manifest.open-wc.org/analyzer/getting-started/).
That is what buys editor autocomplete on the tag, and what the
[docs page](https://stamat.github.io/compare-images-slider/) reads to turn the options
table into knobs beside a live sample.

## Not only images

The name says images and images are the point, but nothing in the script reads the
content: the frame covers the whole slider and is clipped back to the reveal
position, so whatever is inside it is revealed. Two videos, a canvas over a
screenshot, a styled `div` over a photo — all the same to it.

```html
<compare-images-slider>
  <video src="graded.mp4" width="1280" height="720" autoplay muted loop playsinline></video>
  <div class="frame">
    <video src="ungraded.mp4" width="1280" height="720" autoplay muted loop playsinline></video>
  </div>
  <span class="handle"></span>
</compare-images-slider>
```

The stylesheet sizes `img`, `video`, `canvas` and `picture > img` on both layers.
Anything else is yours to size, and the rule is that the two layers have to lay out
identically — the base layer is what gives the slider its height, and the frame is
laid over it.

## Without the custom element

The same markup on a plain element works too — give it the `compare-images-slider`
class for the styles, and instantiate the slider on it yourself. That is the path
for markup whose tag name isn't yours to choose, or a slider built after load:

```html
<div class="js-compare-images-slider compare-images-slider">
  <img src="img.jpg" alt="" />
  <div class="frame">
    <img src="img-alt.jpg" alt="" />
  </div>
  <span class="handle"></span>
</div>
```

```javascript
import CompareImagesSlider from 'compare-images-slider';

const slider = document.querySelector('.js-compare-images-slider');
const compareImagesSlider = new CompareImagesSlider(slider);
```

If you are loading the script asynchronously, you can listen for the `CompareImagesSliderLoaded` event to initialize the slider:

```javascript
document.addEventListener('CompareImagesSliderLoaded', function () {
  const slider = document.querySelector('.js-compare-images-slider');
  const compareImagesSlider = new CompareImagesSlider(slider);
});
```

## Optional theme

The stylesheet above is the slider working: the frame, the handle, the reveal.
It draws the handle as an `↔` glyph in a white circle, which is a look, and a
look that has to be black on white because it knows nothing about the page it
landed on.

The theme is that look done properly, and it is a separate file because a
light-DOM element cannot scope a look away from a page that never asked for one:

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/compare-images-slider/dist/compare-images-slider-theme.min.css"
/>
```

```scss
@use "compare-images-slider/src/styles/theme";
```

It paints the handle in `Canvas`/`CanvasText` — the page's own pair, so the knob
inverts with a dark page and is repainted rather than lost in forced-colors mode
— and it picks up an icon of your own from a `.handle-knob` span inside the
handle:

```html
<span class="handle">
  <span class="handle-knob">
    <svg viewBox="0 0 16 16" width="16" height="16"><!-- your icon --></svg>
  </span>
</span>
```

The knob is markup, so the icon is yours. A handle without one keeps the `↔`
glyph: every rule in the theme sits behind `:has(.handle-knob)`.

**One caveat:** `Canvas` reads the page's `color-scheme`. A page that themes in
custom properties without also declaring one keeps a light `Canvas` when it goes
dark, and the knob goes with it. Two lines fix it, and that is what this repo's
own docs page does:

```css
compare-images-slider {
  --compare-images-slider-handle-bg: var(--your-bg);
  --compare-images-slider-handle-fg: var(--your-fg);
}
```

## Events

Four events on the element, each bubbling, each carrying the position it happened
at as `detail.position` — a number from 0 to 100, unrounded:

| Event | Fires |
| --- | --- |
| `input` | Every move as it happens: a drag, a key, a frame of inertia. What `<input type="range">` calls it |
| `change` | Once the position settles: a press released, a flick come to rest, a key pressed |
| `start` | The handle has just reached 0 — the pane fully collapsed |
| `end` | The handle has just reached 100 — the pane fully revealed |

```javascript
slider.addEventListener('input', (e) => {
  label.textContent = Math.round(e.detail.position) + '%';
});

slider.addEventListener('change', (e) => {
  history.replaceState(null, '', '#' + Math.round(e.detail.position));
});
```

`input` and `change` split the same way they do on a range input: the first is for
anything that should track the handle, the second for anything you would rather not
do sixty times a second. A gesture that ends where it started fires neither.

`start` and `end` fire on arrival, not while the handle sits there — a held arrow
key at 0, or an inertia glide clamped against the edge for several frames, fires
`start` once. They are the moment to swap a caption, not a state to poll.

## Accessibility

The handle is a focusable `role="separator"` implementing the
[W3C APG Window Splitter pattern](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/):
`aria-valuenow`/`min`/`max`, `aria-orientation`, an accessible name, and
`aria-controls` naming the revealed pane. Once focused, arrow keys move by `step`,
Home and End jump to the extremes, and Enter collapses the revealed pane — press
it again and the pane returns to where it was.

Page Up/Down by `pageStep` is this library's own addition, and so is the snap:
double-click or double-tap the slider to send the handle to the extreme it is
further from — read off the pointer stream rather than `dblclick`, which iOS
Safari never fires because a double tap is the browser's own zoom gesture. The
pattern's optional F6 is not implemented; there is one pane here, so there is
nothing to cycle focus between.

The accessible name is `Image comparison slider` unless you say otherwise, and that
string is English. Override it with `aria-label` or `aria-labelledby` on the
`.handle`, or on the element itself, from where either is copied down.
`aria-labelledby` wins, as it does in ARIA, and it is the route that can point at
visible text the page already translates.

The same pattern, spent on resizing rather than revealing — two panes dividing one
width, with a seam between them — is
[`<splitter-elemental>`](https://stamat.github.io/book-of-elementals/elementals/splitter.html)
in book-of-elementals. Same `drag()` underneath, same keys; what differs is that this
one clips one layer over another and that one hands width from one pane to the other.

## Options

Every option is an attribute — bare, `data-*` or kebab-case:

- `vertical` - vertical slider
- `inertia`, `bounce`, `drag-anywhere` - booleans
- `friction`, `bounce-factor`, `max-flick-velocity`, `initial-position`, `step`, `page-step` - numbers

```html
<compare-images-slider vertical>
  <img src="img.jpg" alt="" />
  <div class="frame">
    <img src="img-alt.jpg" alt="" />
  </div>
  <span class="handle"></span>
</compare-images-slider>
```

The constructor reads them off the element too, so they work the same whether you
write `<compare-images-slider>` or call `new CompareImagesSlider(el, options)`. A
`data-*` beats the bare attribute, an attribute beats the options object, and a
boolean is turned off with `drag-anywhere="false"` or `drag-anywhere="0"`.

```javascript
// Default options
const options = {
  inertia: false, // inertia physics, you can flick the handle
  friction: 0.9, // the friction of the inertia
  bounce: false, // will bounce back when inertia is enabled and the boundary is reached
  bounceFactor: 0.1, // the force of the bounce
  maxFlickVelocity: 0.5, // cap on flick velocity (% per ms), tames hard flicks
  vertical: false, // vertical slider
  dragAnywhere: false, // a press anywhere on the images drags, not only the handle
  initialPosition: 50, // starting position (0-100)
  step: 5, // arrow-key step (percent)
  pageStep: 25, // Page Up/Down step (percent)
};

new CompareImagesSlider(slider, options);
```

## Development

```bash
script/bootstrap   # install
script/server      # docs site on :4040, rebuilding as you edit
script/test        # unit tests (node:test)
script/lint
script/build
```

[CONTRIBUTING.md](CONTRIBUTING.md) covers the layout, what is generated, and
what this project refuses to become.

---

Made with ❤️ by @stamat.
