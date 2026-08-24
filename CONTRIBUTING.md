# Contributing to compare-images-slider

Issues and pull requests are welcome. Taking part means keeping to the
[Code of Conduct](CODE_OF_CONDUCT.md).

This is one slider that reveals one layer over another — images, usually, though
the reveal layer takes whatever the markup puts in it — and it intends to stay that size. It
ships no shadow DOM, no build step for the people installing it, and one dependency —
[book-of-spells](https://github.com/stamat/book-of-spells), the sibling spellbook, which
is where the pointer gesture lives so that this element and
[book-of-elementals](https://github.com/stamat/book-of-elementals) cannot drift apart on
it. A second dependency is a decision, not a detail: nothing goes in that is not
another of mine, or that a few lines here could do. A carousel, a zoom, a lightbox, a filter pipeline or a React wrapper all
belong in something else; so does anything that would make the markup ours to
own rather than yours to style. What it will take is the slider being wrong:
a gesture that misbehaves, a keyboard path that dead-ends, a screen reader that
is told the wrong number, a browser where the reveal edge tears.

## Getting set up

```bash
git clone https://github.com/stamat/compare-images-slider.git
cd compare-images-slider
script/bootstrap
```

```bash
script/server    # run the docs site locally on :4040, rebuilding as you edit
script/build     # produce dist/ and the docs page
script/test      # run the tests
script/lint      # run eslint
```

`src/` is the source of truth. `dist/`, `index.html`, `css/`, `js/`,
`sitemap.xml`, `robots.txt`, `llms.txt` and `llms-full.txt` are all build output
and are committed — so a change to any of them made by hand is a change the
next `script/build` throws away. `src/markup/index.md` is the docs page;
`src/styles/prose.scss` is what that page wears, and it is not part of what the
package ships. `src/styles/theme.scss` is — it is the optional look
for the handle, shipped as `dist/compare-images-slider-theme.css`, and the docs
page loads it through `prose.scss` rather than keeping a copy of it.

`img/og.jpg` is the one committed asset the build does not produce. It is the
social card behind `og:image`: the README's key art
(<https://i.imgur.com/e9m4QaU.jpeg>, 1200×800) recomposed to the 1200×630 that
social cards are cropped to. Bottom-aligned, because a centred crop takes the
wordmark off the bottom — and `sips --cropOffset` silently drops the crop rather
than honouring it, so the recomposition goes through headless Chrome instead
(macOS paths below):

```bash
curl -sSLo key-art.jpg https://i.imgur.com/e9m4QaU.jpeg
printf '%s' '<style>html,body{margin:0}img{display:block;width:1200px;height:630px;object-fit:cover;object-position:bottom}</style><img src="key-art.jpg">' > card.html
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --hide-scrollbars --window-size=1200,630 --virtual-time-budget=4000 \
  --screenshot=card.png "file://$PWD/card.html"
sips -s format jpeg -s formatOptions 82 card.png --out img/og.jpg
```

Update the `og:image:alt` line in the front matter of `src/markup/index.md` if
what the card shows has changed.

`dist/custom-elements.json` is generated too, by `cem analyze` from the JSDoc
block on `CompareImagesSliderElement`. That block is where an attribute or a
custom property gets documented once — the manifest, the editor autocomplete
and the knobs on the docs page all come out of it.

## Reporting a bug

[Open an issue](../../issues/new/choose) — the form asks for what you ran, what
you expected, the version and the environment, because those are the four things
every fix starts from. A reproduction is worth more than a description of one.

A gesture bug is the hard case to describe in words. If you can, say which
pointer type (mouse, touch, pen), which browser, and whether it happens with
`inertia` off as well as on.

## Pull requests

- **Add a test.** A bug fix gets a test that fails without the fix. The physics
  helpers in `src/scripts/compare-images-slider.js` are exported one by one so
  they can be tested without a DOM — `test/physics.test.js` is the pattern.
- **Match the surrounding style.** `script/lint` is the authority, and CI runs it.
- **Add a changelog entry** under `## [Unreleased]` in
  [CHANGELOG.md](CHANGELOG.md) — that file explains the format.
- **Keep the diff about one thing.** A rename bundled with a fix is two reviews
  wearing one hat.
- **Agent-written code is welcome — you still own it.** It meets the same bar
  as handwritten code: tests, lint, CI green. You understand every line well
  enough to answer review questions; "the agent wrote it" is not an answer.

Commit messages are freeform, write something that says what changed.

## How a release works

Maintainer flow, recorded here so the automation isn't a mystery:

`script/publish [version]` refuses to start quietly on a dirty tree — it prints
what is uncommitted and asks, because everything left lying around would ride
along in the release commits. Then it writes the version into `package.json`,
calls `script/changelog` to cut the entry, and commits both; runs
`script/build` and commits the output; tags `v<version>` and pushes the branch
and the tag. A step with nothing to commit is skipped rather than failing the
run, and any command that exits non-zero stops the release there.

`script/changelog <version>` is the piece that rolls `## [Unreleased]` over
into `## [<version>] - <date>`, leaving a fresh empty `[Unreleased]` behind. It
runs inside the bump commit on purpose, so the tag contains the released
entry and no CI step has to push back to `main`. A `## [Unreleased]` sitting in
a code fence — the format example near the top of the file — is skipped, so
documenting the format doesn't break cutting it. The entry is also written to
the temp dir, and that file becomes the GitHub release body below.

Pushing the tag triggers [publish.yml](.github/workflows/publish.yml), which
publishes to npm via trusted publishing — OIDC, no token stored anywhere. That
workflow is the only thing that publishes; `script/publish` never runs `npm
publish` from your machine.

Last, it offers to create a GitHub release with `gh`, using the changelog
entry as the body with the generated commit notes under it. If there is no
entry to cut, it falls back to asking you for notes.
