---
layout: default
---
<div class="github-buttons">
  <a class="github-button" href="https://github.com/stamat/compare-images-slider" data-size="large" aria-label="Download stamat/compare-images-slider on GitHub">View on GitHub</a>
</div>


<h1 class="mb-0 mt-lg-128 mt-80">{{ site.title }}</h1>
<p class="p1 mb-64 mt-16 text-gray">{{ site.description }}</p>

<div class="js-compare-images-slider compare-images-slider">
  <img width="1680" height="1120" src="https://i.imgur.com/Ju4pEb7.jpeg" loading="lazy" alt="">
  <div class="frame">
    <img width="1680" height="1120" src="https://i.imgur.com/pvWyCKw.jpeg" loading="lazy" alt="">
  </div>
  <span class="handle"></span>
</div>

Photo by <a href="https://unsplash.com/@necone?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Nenad Radojčić</a> on <a href="https://unsplash.com/photos/gray-concrete-building-under-white-sky-during-daytime-JBm5eNo6B4E?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

<div class="js-compare-images-slider compare-images-slider" vertical>
  <img width="1680" height="1120" src="https://i.imgur.com/VWdIu81.jpeg" loading="lazy" alt="">
  <div class="frame">
    <img width="1680" height="1120" src="https://i.imgur.com/C7zhEkz.jpeg" loading="lazy" alt="">
  </div>
  <span class="handle"></span>
</div>

Photo by <a href="https://unsplash.com/@valentinsalja?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Valentin Salja</a> on <a href="https://unsplash.com/photos/withered-tree-covered-in-snow-AqcD0Q1JLpE?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>


<script>
  const sliders = document.querySelectorAll('.js-compare-images-slider');
  const options = {
    inertia: true
  }

  if (window.CompareImagesSlider) {
    for (let i = 0; i < sliders.length; i++) {
      const compareImagesSlider = new CompareImagesSlider(sliders[i], options);
    }
  } else {
    document.addEventListener('CompareImagesSliderLoaded', function() {
      for (let i = 0; i < sliders.length; i++) {
        const compareImagesSlider = new CompareImagesSlider(sliders[i], options);
      }
    }); 
  }
</script>

<div class="my-64 text-right text-gray text-italic">
Made with ❤️ by <a href="https://github.com/stamat">@stamat</a>.
</div>
