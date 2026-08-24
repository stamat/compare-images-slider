// The decisions the slider makes, each pulled out as a pure function so it can be tested
// without a browser: the key map, the double tap, the collapse toggle, which extreme an
// arrival earns an event for, and how options resolve.
//
// The flick is book-of-spells' now, whole - sampled, capped in per cent of the track and
// glided by `drag()` - and the guarantees it used to be held to here are held to there: the
// window that smooths a flick spike, the too-short gesture that reads zero, the cap that reads
// the same at every width, the friction applied per millisecond rather than per frame.
//
// The upgrade decision is here too, as `upgradeAction`: whether an element connecting
// without its children is mid-parse or simply mis-marked-up, which is the difference
// between waiting and reporting a broken slider.
//
// Not covered here, deliberately: anything needing layout or a real event stream - the
// reveal geometry, pointer capture, the ARIA the handle carries, the events actually
// leaving the element, and the `DOMContentLoaded` listener `upgradeAction` sends the
// waiting case to. Those are checked in a browser, since a DOM stub asserting them
// would only be testing the stub.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  keyboardStep,
  isDoubleTap,
  nearestExtreme,
  edgeEvent,
  collapseToggle,
  readOptionsFromElement,
  resolveOptions,
  upgradeAction,
  DEFAULT_OPTIONS
} from '../src/scripts/compare-images-slider.js';

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

test('a slider whose children have not been parsed yet waits, one with the wrong markup does not', () => {
  assert.equal(upgradeAction(true, 'loading'), 'build', 'children present mid-parse need no wait');
  assert.equal(upgradeAction(true, 'complete'), 'build', 'children present after load build straight away');
  assert.equal(upgradeAction(false, 'loading'), 'wait', 'the parser has not reached the children yet');
  assert.equal(upgradeAction(false, 'interactive'), 'fail', 'the parser has been and gone, so the markup is wrong');
  assert.equal(upgradeAction(false, 'complete'), 'fail', 'an element built after load carries its children or it is broken');
});
