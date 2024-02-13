import CompareImagesSlider from './compare-images-slider';

if (!window.CompareImagesSlider) {
  window.CompareImagesSlider = CompareImagesSlider;
  document.dispatchEvent(new CustomEvent('CompareImagesSliderLoaded'));
}
