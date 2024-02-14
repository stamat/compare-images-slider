---
layout: default
---
<div class="github-buttons">
  <a class="github-button" href="https://github.com/stamat/compare-images-slider" data-size="large" aria-label="Download stamat/compare-images-slider on GitHub">View on GitHub</a>
</div>

<div class="container mb-64">
  <h1>{{ site.title }}</h1>
  <p class="p1">{{ site.description }}</p>

  <div class="js-compare-images-slider compare-images-slider">
    <img width="1680" height="1120" src="{{ relativePathPrefix }}dist/assets/img.jpg" loading="lazy" alt="">
    <div class="frame">
      <img width="1680" height="1120" src="{{ relativePathPrefix }}dist/assets/img-alt.jpg" loading="lazy" alt="">
    </div>
    <span class="handle"></span>
  </div>

  <script>
    const slider = document.querySelector('.js-compare-images-slider');
    const options = {
      inertia: true,
      bounce: true,
    }

    if (window.CompareImagesSlider) {
      const compareImagesSlider = new CompareImagesSlider(slider, options);
    } else {
      document.addEventListener('CompareImagesSliderLoaded', function() {
        const compareImagesSlider = new CompareImagesSlider(slider, options);
      }); 
    }
  </script>

  Photo by <a href="https://unsplash.com/@necone?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Nenad Radojčić</a> on <a href="https://unsplash.com/photos/gray-concrete-building-under-white-sky-during-daytime-JBm5eNo6B4E?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
</div>
  
