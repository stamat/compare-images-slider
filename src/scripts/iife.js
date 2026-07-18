import CompareImagesSlider, { CompareImagesSliderElement } from './compare-images-slider';

if (!window.CompareImagesSlider) {
  window.CompareImagesSlider = CompareImagesSlider;
  window.CompareImagesSliderElement = CompareImagesSliderElement;
  document.dispatchEvent(new CustomEvent('CompareImagesSliderLoaded'));
}
