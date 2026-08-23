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
Give the heading a short title after an em dash and open with one paragraph
saying what was wrong before:

```markdown
## [Unreleased] — a flick no longer slams into the edge

Velocity was measured from the last two pointer events, so one large jump
between them sent the handle straight to 0 or 100.

### Fixed

- ...
```

Write it for the person upgrading, not for the person who wrote the code. What
they need is what changed for them: a renamed option, a different default, an
error that is now thrown, output that moved.

## [Unreleased]

### Added

- **<kbd>Enter</kbd> collapses the revealed pane, and puts it back.** The handle
  claimed the W3C APG Window Splitter pattern while missing the one key that
  pattern does not mark optional: Enter, which collapses the primary pane and
  restores it to its previous position on a second press. Every other requirement
  was already there, so the claim was true but for this. Pressing Enter on a pane
  already dragged to 0, with nothing recorded to restore, opens it halfway rather
  than doing nothing.

- **`llms.txt`, `llms-full.txt`, `sitemap.xml` and `robots.txt`.** poops generates
  all four from the compiled pages and none of them were switched on, so a crawler
  or a model arriving at the site had nothing but the page to work from.
  `llms-full.txt` is the whole docs page as Markdown in one file — the cheap way
  for a model to read it end to end instead of parsing the rendered HTML.

- **A social card, `img/og.jpg`.** `twitter:card` was `summary` with no image
  behind it, so a shared link was a text row. The card is the README’s key art
  recomposed to 1200×630 and served from the site rather than hotlinked, and
  `og:image:alt` describes it for anyone who cannot see it.

### Changed

- **The reveal is a `clip-path`, and the slider no longer measures anything.** The
  frame used to be sized to the reveal position, which meant the image inside it
  had to be stretched back to the slider's full width in pixels by the script — on
  load, and again on every window resize. A slider whose container changed size
  without the window changing with it kept the stale width and the reveal edge
  drifted off the handle. The frame now covers the whole slider and is clipped back
  to the position instead, so every value in the reveal is a percentage the browser
  keeps correct on its own. The `resize` listener is gone.

  Two things follow for anyone styling this. The live position is readable as
  `--compare-images-slider-position` on the element, written on every render, so
  page CSS can hang off the reveal. And `.frame` no longer carries an inline
  `width` or `height`: styling that read either one has to read that property now.

- **The accessibility docs say which keys are the pattern's and which are ours.**
  Page Up/Down and the double-click snap are this library's additions, F6 is
  deliberately not implemented, and `aria-orientation` reports the orientation of
  the divider rather than of the layout — a left/right slider is `vertical`. All
  four read as bugs against the pattern until stated, and none of them were.

- **The page names what it is.** `<title>` was the bare brand, and the tagline
  under the `h1` — which is also the meta description, the `og:description` and
  the JSON-LD description — said "a simple slider for comparing two images
  visually", which matches nothing anyone would type looking for one. Both say
  before/after image comparison web component now. The JSON-LD block was a generic
  `WebPage`; it is `SoftwareSourceCode`, carrying the repository, the licence, the
  language and the runtime platform, because that is what the page documents.

## [2.0.0] - 2026-08-23

### Added

- **An optional theme, `dist/compare-images-slider-theme.css`.** The handle the
  stylesheet draws is an `↔` glyph in a white circle — a look, and one hard-coded
  black on white because it knows nothing about the page it landed on. The theme
  paints it in `Canvas`/`CanvasText` instead, so it inverts with a dark page and
  survives forced-colors mode, and it takes an icon of your own from a
  `.handle-knob` span inside the handle. It is a separate file because a
  light-DOM element cannot scope a look away from a page that never asked for
  one, and every rule in it sits behind `:has(.handle-knob)`, so a handle without
  a knob keeps the glyph. Load it as `compare-images-slider/theme.css`, or
  `@use "compare-images-slider/src/styles/theme"` in Sass.

- **An `exports` map, and a `files` list.** The package used to publish the whole
  working tree — the docs page, its `css/` and `js/`, the tests, the scripts. Now
  it ships `dist/`, `src/scripts/` and the two stylesheets, and names the subpaths
  worth importing: `.`, `./style.css`, `./style.scss`, `./theme.css`,
  `./theme.scss`, `./custom-elements.json`, plus `./styles/*` and `./dist/*` for
  anything else. Deep paths into `src/` other than those two stylesheets no longer
  resolve through the package name.

- **A Custom Elements Manifest at `dist/custom-elements.json`,** generated by
  `cem analyze` from the JSDoc block on `CompareImagesSliderElement` and pointed
  at by the `customElements` key in `package.json`. Every attribute and custom
  property is described there once, which is what editor autocomplete reads —
  and what the docs page turns into knobs beside a live sample.

- **The options table on the docs page runs.** The sample under it is a
  [`<code-preview>`](https://github.com/stamat/code-preview-element): the markup
  renders in a frame above the code that produced it, and the **Options** tab is
  the table again as controls, built from the manifest. Turning one rewrites the
  attribute in the code, so the example and what it does cannot drift apart.

- **CONTRIBUTING.md, CODE_OF_CONDUCT.md, issue and pull request templates,**
  from [stamat/template](https://github.com/stamat/template) — plus
  `script/bootstrap`, `script/test` and `script/lint`, so the commands those
  files name are commands that exist.

### Fixed

- **A long press no longer offers to save the image on iOS.** A slow drag could
  trip the system callout — the Save Image sheet — over the two `img` elements.
  The stylesheet asks for `-webkit-touch-callout: none` explicitly now instead of
  relying on `-webkit-user-select: none` to suppress it as a side effect, which is
  behaviour that has regressed in past WebKit builds.

- **Double-tap to snap now works on iOS.** The snap to the nearest extreme was a
  `dblclick` listener, and iOS Safari never fires that event from a double tap —
  the gesture is the browser's own zoom, and always has been. It is detected from
  the pointer stream instead, for every pointer type rather than one code path per
  platform: two presses within 400ms that each travelled under 1% of the slider.
  A double-click with a mouse behaves as before.

- **A cancelled drag no longer flies off on a flick.** `pointercancel` was wired
  to the same handler as `pointerup`, so when the system took the gesture away —
  a call arriving, the page scrolling out from under the finger — the half-drawn
  velocity samples were thrown as if you had let go on purpose. iOS Safari raises
  that event far more readily than a desktop browser does, so this mostly showed
  up on a phone: the handle stops where it stands now.

- **Attributes now work on a slider you construct yourself.** `drag-anywhere`,
  `inertia`, `bounce`, `friction` and the rest were parsed only on the
  `<compare-images-slider>` element; on a `<div class="js-compare-images-slider">`
  passed to `new CompareImagesSlider(el)` every one of them was silently ignored
  except `vertical` and `initial-position`. The constructor reads the element's
  attributes itself now, so both ways of instantiating honour the same markup.

- **A boolean attribute can be turned off.** `vertical="false"` set vertical
  *on* — the old reader could only ever set `true` — so the only way to override
  a boolean was to not write it. `="false"` and `="0"` now mean false everywhere,
  and the `vertical` attribute the stylesheet keys off is kept in step with the
  resolved option, instead of leaving the layout on one axis and the script on
  the other.

- **`drag-anywhere` survives a touch drag.** `touch-action: none` sat on the
  handle alone, so with the whole slider as the drag target a touch on the images
  was taken by the browser's scroll gesture instead. It is applied to whichever
  element is actually dragged.

### Changed

- **`onlyHandle` is now `dragAnywhere`, and defaults to `false`.** It was the one
  boolean here defaulting to `true`, so its off state could only be written as a
  value — `only-handle="false"`. Anything that writes a boolean attribute by
  presence, the options panel on the docs page included, could not express it at
  all: a missing `only-handle` and a bare one both read as `true`, which made the
  control inert. The sense is inverted instead of the default patched, so writing
  the attribute turns dragging from the images on and removing it puts the drag
  back on the handle alone. Upgrading: `onlyHandle: false` becomes
  `dragAnywhere: true`, `only-handle="false"` becomes `drag-anywhere`, and the
  handle-only default needs nothing written at all. `onlyHandle` is no longer
  read.

- **Poops 2.0 → 3.0 and poops-docs-theme 1.1 → 4.5,** which brings
  book-of-spells 1.4 → 2.5 with them. Docs-site build only — nothing in `dist/`
  changes shape, and nothing installing this package is affected. The topbar is
  built out of custom elements now, so the npm link moved from `site.links` to
  `site.iconLinks` to be the icon button the theme intends it as.
