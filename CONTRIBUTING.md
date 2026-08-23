# Contributing to compare-images-slider

Issues and pull requests are welcome. Taking part means keeping to the
[Code of Conduct](CODE_OF_CONDUCT.md).

This is one slider that reveals one image over another, and it intends to stay
that size. It ships no shadow DOM, no dependencies and no build step for the
people installing it — those three are the point, not an accident of it being
small. A carousel, a zoom, a lightbox, a filter pipeline or a React wrapper all
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

`src/` is the source of truth. `dist/`, `index.html`, `css/` and `js/` are all
build output and are committed — so a change to any of them made by hand is a
change the next `script/build` throws away. `src/markup/index.md` is the docs
page; `src/styles/prose.scss` is what that page wears, and it is not part of
what the package ships. `src/styles/theme.scss` is — it is the optional look
for the handle, shipped as `dist/compare-images-slider-theme.css`, and the docs
page loads it through `prose.scss` rather than keeping a copy of it.

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
along in the release commits. Then it writes the version into `package.json`
and commits it, runs `script/build` and commits the output, tags `v<version>`
and pushes both the branch and the tag. A step with nothing to commit is
skipped rather than failing the run, and any command that exits non-zero stops
the release there.

Pushing the tag triggers [publish.yml](.github/workflows/publish.yml), which
publishes to npm via trusted publishing — OIDC, no token stored anywhere. That
workflow is the only thing that publishes; `script/publish` never runs `npm
publish` from your machine.

Last, it offers to cut a GitHub release with `gh`, taking notes you type or
generating them from the commits.
