// The decisions the slider makes, each pulled out as a pure function so it can be tested
// without a browser: the key map, the double tap, the collapse toggle, which extreme an
// arrival earns an event for, how options resolve, and the flick this element turns those
// into.
//
// `clamp` and `sampleVelocity` are book-of-spells' now, and the guarantees they used to be
// held to here are held to there - the range and its NaN, the window that smooths a flick
// spike, and the too-short gesture that reads zero. What stays below is the composition
// this element does with them, which is nobody else's.
//
// Not covered here, deliberately: anything needing layout or a real event stream - the
// reveal geometry, pointer capture, the ARIA the handle carries, the events actually
// leaving the element. Those are checked in a browser, since a DOM stub asserting them
// would only be testing the stub.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clamp, sampleVelocity } from 'book-of-spells/src/helpers.mjs';
import {
  keyboardStep,
  isDoubleTap,
  nearestExtreme,
  edgeEvent,
  collapseToggle,
  readOptionsFromElement,
  resolveOptions,
  DEFAULT_OPTIONS
} from '../src/scripts/compare-images-slider.js';

test('a flick is smoothed over the window and then held to the ceiling, in per cent per millisecond', () => {
  // The composition `onDragEnd` does: sample the gesture, then cap what it carries. A slow
  // build-up and one large last-frame jump is the classic spike, and the whole point of
  // measuring over the window is that the spike is not what the flick carries.
  const samples = [
    { t: 0, pos: 10 },
    { t: 16, pos: 20 },
    { t: 32, pos: 35 },
    { t: 48, pos: 90 }
  ];
  const singleFrame = (90 - 35) / (48 - 32); // ~3.44 %/ms
  const windowed = sampleVelocity(samples, 80).pos;
  assert.ok(windowed < singleFrame, 'windowed velocity must be lower than the spike');
  // Over the full 48ms window: (90-10)/48
  assert.ok(Math.abs(windowed - 80 / 48) < 1e-9);

  // And the ceiling is per cent per millisecond, which is what keeps the same flick reading
  // the same on a narrow slider and a wide one.
  const ceiling = DEFAULT_OPTIONS.maxFlickVelocity;
  assert.equal(clamp(windowed, -ceiling, ceiling), ceiling);
  assert.equal(clamp(-windowed, -ceiling, ceiling), -ceiling);

  // A gesture with one sample in it is not a speed, and must not reach the ceiling as a NaN.
  assert.equal(sampleVelocity([{ t: 0, pos: 10 }]).pos, 0);
});

test('Enter collapses the primary pane and puts it back where it was', () => {
  assert.equal(collapseToggle(65, 65), 0, 'an open pane collapses');
  assert.equal(collapseToggle(0, 65), 65, 'a collapsed pane returns to its old position');
  assert.equal(collapseToggle(0, 0), 50, 'a pane collapsed before Enter was ever pressed opens halfway');
  assert.equal(collapseToggle(0, 140), 100, 'a restore position out of range is clamped');
});

test('keyboardStep implements the window splitter key map', () => {
  assert.equal(keyboardStep(50, 'ArrowRight', 5, 25), 55);
  assert.equal(keyboardStep(50, 'ArrowDown', 5, 25), 55);
  assert.equal(keyboardStep(50, 'ArrowLeft', 5, 25), 45);
  assert.equal(keyboardStep(50, 'ArrowUp', 5, 25), 45);
  assert.equal(keyboardStep(50, 'PageUp', 5, 25), 75);
  assert.equal(keyboardStep(50, 'PageDown', 5, 25), 25);
  assert.equal(keyboardStep(50, 'Home', 5, 25), 0);
  assert.equal(keyboardStep(50, 'End', 5, 25), 100);
  assert.equal(keyboardStep(98, 'ArrowRight', 5, 25), 100, 'clamps at the max');
  assert.equal(keyboardStep(2, 'ArrowLeft', 5, 25), 0, 'clamps at the min');
  assert.equal(keyboardStep(50, 'Tab', 5, 25), null, 'ignores unrelated keys');
});

test('readOptionsFromElement parses booleans and numbers from attributes', () => {
  const attrs = {
    inertia: 'true',
    'drag-anywhere': 'true',
    friction: '0.8',
    'initial-position': '30'
  };
  const el = { dataset: {}, getAttribute: (n) => (n in attrs ? attrs[n] : null) };
  assert.deepEqual(readOptionsFromElement(el), {
    inertia: true,
    dragAnywhere: true,
    friction: 0.8,
    initialPosition: 30
  });
});

test('readOptionsFromElement prefers data-* over bare attributes', () => {
  const el = {
    dataset: { initialPosition: '70' },
    getAttribute: () => '10'
  };
  assert.equal(readOptionsFromElement(el).initialPosition, 70);
});

test('an attribute beats the options object, and "false" turns a boolean off', () => {
  const attrs = { 'drag-anywhere': 'false', vertical: '' };
  const el = { dataset: {}, getAttribute: (n) => (n in attrs ? attrs[n] : null) };
  const options = resolveOptions(el, { dragAnywhere: true, vertical: false, step: 10 });
  assert.equal(options.dragAnywhere, false, 'the attribute must override the passed option');
  assert.equal(options.vertical, true, 'a bare attribute reads as true');
  assert.equal(options.step, 10, 'an option with no attribute survives');
  assert.equal(options.friction, 0.9, 'the rest falls back to the defaults');
});

test('resolveOptions leaves the defaults object untouched', () => {
  const el = { dataset: {}, getAttribute: () => null };
  resolveOptions(el, { inertia: true });
  assert.equal(DEFAULT_OPTIONS.inertia, false);
});

test('two quick presses in the same spot are a double tap, a slow pair is not', () => {
  assert.equal(isDoubleTap(300, 100, 0), true, '200ms apart, unmoved');
  assert.equal(isDoubleTap(700, 100, 0), false, '600ms apart is two separate taps');
  assert.equal(isDoubleTap(300, 0, 0), false, 'there was no first tap to pair with');
});

test('a press that dragged is never half of a double tap', () => {
  assert.equal(isDoubleTap(300, 100, 5), false, 'the handle travelled 5%');
  assert.equal(isDoubleTap(300, 100, 1), true, 'a wobble inside the slop still taps');
});

test('a snap sends the handle to the edge it is further from, so it toggles', () => {
  assert.equal(nearestExtreme(20), 100);
  assert.equal(nearestExtreme(80), 0);
  assert.equal(nearestExtreme(100), 0, 'snapping again comes back');
  assert.equal(nearestExtreme(50), 0, 'dead centre goes to the start');
});

test('reaching an extreme is an event, sitting at one is not', () => {
  assert.equal(edgeEvent(40, 0), 'start');
  assert.equal(edgeEvent(40, 100), 'end');
  assert.equal(edgeEvent(0, 0), null, 'a held key at 0 has not arrived again');
  assert.equal(edgeEvent(100, 100), null, 'nor has an inertia glide clamped at 100');
  assert.equal(edgeEvent(0, 100), 'end', 'crossing from one extreme to the other counts');
  assert.equal(edgeEvent(40, 41), null, 'an ordinary move earns nothing');
});
