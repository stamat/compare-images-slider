# Changelog

All notable changes to compare-images-slider are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Entries start at the version this file was added; releases before it are in the
[GitHub releases](https://github.com/stamat/compare-images-slider/releases),
generated from commits.

## Contributing an entry

Write your change under `## [Unreleased]`, grouped under `### Added`,
`### Changed`, `### Fixed`, `### Deprecated`, `### Removed` or `### Security`.
Give the heading a short title after an em dash and open with a sentence or two
saying what was wrong before — those become the title and description of the
release notes.

Keep it bare: one sentence per bullet saying what changed, one saying why, and
two is the ceiling. Write it for the person upgrading — a renamed option, a
different default, an error that is now thrown, output that moved. How it was
verified, what was rejected on the way, and internals nobody can reach stay out.

```markdown
## [Unreleased] — a flick no longer slams into the edge

Velocity was measured from the last two pointer events, so one large jump
between them sent the handle straight to 0 or 100.

### Fixed

- **A flick is sampled over a window rather than two events.** ...
```

## [Unreleased]

## [5.0.0] - 2026-08-24 — prefixed classes, and `frame` is now `reveal`

`.frame`, `.handle` and `.handle-knob` were unprefixed class names on a light-DOM
element, so a page with its own `.frame` collided with them and had no way out.
`frame` named the wrong thing too: the element is the layer laid over the base one
and clipped back to the handle.

### Changed

- **The three classes are prefixed, and `frame` is now `reveal`.** Rename them in your
  markup; nothing else about the element changed — the same tag, options, events,
  keyboard and ARIA.

  | Was            | Now                                  |
  | -------------- | ------------------------------------ |
  | `.frame`       | `.compare-images-slider-reveal`      |
  | `.handle`      | `.compare-images-slider-handle`      |
  | `.handle-knob` | `.compare-images-slider-handle-knob` |

  The old names are gone rather than deprecated: `new CompareImagesSlider(el)` throws
  and `<compare-images-slider>` logs, both naming the two classes they wanted.

- **`slider.frame` is now `slider.reveal`.** It is in no example and no documentation,
  so this only reaches you if you reached into the instance.

- **The generated `aria-controls` id is `compare-images-slider-reveal-N`,** where it was
  `compare-images-slider-frame-N`. It is only generated when the reveal layer has no
  `id` of its own, so markup that sets one is untouched.

### Fixed

- **`<compare-images-slider>` upgrades when the script is loaded in `<head>`, and says
  so on the console when the markup is wrong.** `connectedCallback` runs at the start
  tag before any child exists, and the element read those absent children as broken
  markup and returned silently — so the CDN snippet in the README left every slider a
  plain stack of two images.

## [4.0.0] - 2026-08-24 — the gesture is book-of-spells' now, glide included

The pointer capture, the move and up and cancel listeners and the flick sampling were
written out here, and the sampling and the velocity cap existed in book-of-spells'
`drag()` as well — one flick measured two ways in two repositories.

### Changed

- **One dependency, `book-of-spells@^2.8.0`, where there were none.** The gesture and its
  inertia live there now; the markup, options, events, keyboard and ARIA are unchanged,
  and the README no longer says *dependency-free*.

- **A release held still under `inertia` reports `change` one frame later than it did.**
  Every release books a glide frame, and that frame is spent finding there is nothing to
  glide on.

### Fixed

- **The focus ring on the handle is the system highlight colour in every browser.** A
  `-webkit-focus-ring-color` declaration had Chromium drawing an orange of its own, so a
  focused handle broke a page that was blue everywhere else.

### Removed

- **`clamp`, `capVelocity` and `sampleVelocity` are no longer exported from this package.**
  Import `clamp` and `sampleVelocity` from
  [book-of-spells](https://github.com/stamat/book-of-spells) instead; `capVelocity(v, max)`
  is `clamp(v, -max, max)`, and `sampleVelocity` answers with an object per numeric key
  rather than a bare number.

## [3.0.1] - 2026-08-23 — a translated name on the element now reaches the handle

`aria-label` was copied down onto the handle but `aria-labelledby` was not, so pointing
the element at a visible, translated heading left the handle announcing the English
fallback.

### Fixed

- **`aria-labelledby` on the element is copied onto the handle,** and wins over
  `aria-label` when both are set, as it does in ARIA. A name already on the handle still
  wins over either.

## [3.0.0] - 2026-08-23 — nothing measures anything any more

The reveal was a pixel width the script wrote onto the overlay image, so a slider whose
container resized without the window resizing with it kept a stale width and let the
reveal edge drift off the handle. It is a `clip-path` now.

### Added

- **The slider says where it is: `input`, `change`, `start` and `end`.** All four bubble
  and carry `detail.position`, 0 to 100 unrounded; `input` and `change` split the way they
  do on a range input, and `start` and `end` fire when the handle arrives at an extreme.

- **The reveal takes whatever the markup puts in it, not only an `img`.** Two videos, a
  canvas over a screenshot or a styled `div` over a photo all work — the stylesheet sizes
  `img`, `video`, `canvas` and `picture > img` on both layers, and anything else is yours
  to size.

- **<kbd>Enter</kbd> collapses the revealed pane, and puts it back.** It is the one key
  the W3C Window Splitter pattern does not mark optional, and it was the only one missing;
  on a pane already at 0 with nothing recorded to restore, it opens halfway.

- **A named error when the markup is missing a part.** A missing child used to surface two
  calls later as `Cannot read properties of null`.

- **A measured comparison against the other five sliders, on the docs page.** It is
  `gzip -9` over what each package ships, with every behaviour row read out of those
  bundles rather than quoted from their docs.

- **`llms.txt`, `llms-full.txt`, `sitemap.xml` and `robots.txt`.** poops generates all four
  and none of them were switched on, so a crawler or a model had nothing but the page.

- **A social card, `img/og.jpg`.** `twitter:card` was `summary` with no image behind it, so
  a shared link was a text row.

### Changed

- **The reveal is a `clip-path`, so `.frame` no longer carries an inline `width` or
  `height`.** Page styling that read either one reads `--compare-images-slider-position` on
  the element instead, written on every render.

- **The `resize` listener is gone.** Every value in the reveal is a percentage the browser
  keeps correct on its own.

- **The accessibility docs say which keys are the pattern's and which are ours.** Page
  Up/Down and the double-click snap are this library's additions, F6 is deliberately not
  implemented, and `aria-orientation` reports the orientation of the divider — a left/right
  slider is `vertical`.

- **The page names what it is.** The title, the tagline, the meta description and the
  JSON-LD say before/after image comparison web component now, and the JSON-LD block is
  `SoftwareSourceCode` rather than a generic `WebPage`.

## [2.0.0] - 2026-08-23

### Added

- **An optional theme, `dist/compare-images-slider-theme.css`.** It paints the handle in
  `Canvas`/`CanvasText` so it inverts with a dark page and survives forced-colors mode, and
  takes an icon of your own from a `.handle-knob` span; load it as
  `compare-images-slider/theme.css`, or `@use "compare-images-slider/src/styles/theme"` in
  Sass.

- **An `exports` map, and a `files` list.** The package used to publish the whole working
  tree; it ships `dist/`, `src/scripts/` and the two stylesheets now, and deep paths into
  `src/` other than those stylesheets no longer resolve through the package name.

- **A Custom Elements Manifest at `dist/custom-elements.json`.** Every attribute and custom
  property is described there once, which is what editor autocomplete reads.

- **The options table on the docs page runs.** The sample under it is a
  [`<code-preview>`](https://github.com/stamat/code-preview-element) whose Options tab is
  the table again as controls, so the example and what it does cannot drift apart.

- **CONTRIBUTING.md, CODE_OF_CONDUCT.md, issue and pull request templates,** plus
  `script/bootstrap`, `script/test` and `script/lint`, so the commands those files name are
  commands that exist.

### Fixed

- **A long press no longer offers to save the image on iOS.** The stylesheet asks for
  `-webkit-touch-callout: none` explicitly instead of relying on `-webkit-user-select` to
  suppress the callout as a side effect.

- **Double-tap to snap now works on iOS.** It was a `dblclick` listener, which iOS Safari
  never fires from a double tap; it is read off the pointer stream now — two presses within
  400ms that each travelled under 1% of the slider.

- **A cancelled drag no longer flies off on a flick.** `pointercancel` shared a handler with
  `pointerup`, so a gesture the system took away threw the half-drawn velocity samples as if
  you had let go; the handle stops where it stands.

- **Attributes now work on a slider you construct yourself.** Every attribute but `vertical`
  and `initial-position` was silently ignored on `new CompareImagesSlider(el)`.

- **A boolean attribute can be turned off.** `vertical="false"` set vertical *on*, since the
  old reader could only ever set `true`; `="false"` and `="0"` mean false everywhere now.

- **`drag-anywhere` survives a touch drag.** `touch-action: none` sat on the handle alone, so
  with the whole slider as the drag target a touch on the images went to the browser's scroll
  gesture instead.

### Changed

- **`onlyHandle` is now `dragAnywhere`, and defaults to `false`.** `onlyHandle: false`
  becomes `dragAnywhere: true`, `only-handle="false"` becomes `drag-anywhere`, and the
  handle-only default needs nothing written at all.

- **Poops 2.0 → 3.0 and poops-docs-theme 1.1 → 4.5.** Docs-site build only — nothing in
  `dist/` changes shape, and nothing installing this package is affected.
