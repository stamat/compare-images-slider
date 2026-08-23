import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  clamp,
  sampleVelocity,
  capVelocity,
  keyboardStep,
  isDoubleTap,
  nearestExtreme,
  readOptionsFromElement,
  resolveOptions,
  DEFAULT_OPTIONS
} from '../src/scripts/compare-images-slider.js';

test('clamp keeps values inside the range', () => {
  assert.equal(clamp(150, 0, 100), 100);
  assert.equal(clamp(-5, 0, 100), 0);
  assert.equal(clamp(42, 0, 100), 42);
});

test('capVelocity limits magnitude but keeps sign', () => {
  assert.equal(capVelocity(5, 0.5), 0.5);
  assert.equal(capVelocity(-5, 0.5), -0.5);
  assert.equal(capVelocity(0.2, 0.5), 0.2);
});

test('sampleVelocity is undeterminable with too few samples', () => {
  assert.equal(sampleVelocity([]), 0);
  assert.equal(sampleVelocity([{ t: 0, pos: 10 }]), 0);
});

test('sampleVelocity smooths a quick-flick spike vs a single frame delta', () => {
  // A slow build-up then one large last-frame jump - the classic flick spike.
  const samples = [
    { t: 0, pos: 10 },
    { t: 16, pos: 20 },
    { t: 32, pos: 35 },
    { t: 48, pos: 90 }
  ];
  const singleFrame = (90 - 35) / (48 - 32); // ~3.44 %/ms
  const windowed = sampleVelocity(samples, 80);
  assert.ok(windowed < singleFrame, 'windowed velocity must be lower than the spike');
  // Over the full 48ms window: (90-10)/48
  assert.ok(Math.abs(windowed - 80 / 48) < 1e-9);
});

test('capVelocity tames even the smoothed flick to the configured ceiling', () => {
  const samples = [{ t: 0, pos: 0 }, { t: 16, pos: 100 }];
  const capped = capVelocity(sampleVelocity(samples), 0.5);
  assert.equal(capped, 0.5);
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
