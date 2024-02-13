---
layout: default
---
<div class="container">
  <h1>{{ site.title }}</h1>
  {{ site.description }}
</div>

<div class="before-after-wrap">
  <img class="spacer main-spacer" src="{{'switch-spacer.png' | asset_url}}" alt="" />
  {% for block in section.blocks %}
      <div class="before-after slider target-{{block.settings.type}}{%if forloop.index == 1%} active{% endif %}">
            <div class="slide slide1 loadme" style="background-image: url({{block.settings.after | img_url: '300x'}})" data-full="{{block.settings.after | img_url: '1440x'}}"></div>
            <div class="resize">
                <div class="slide-wrap">
                    <div class="slide slide2 loadme" style="background-image: url({{block.settings.before | img_url: '300x'}})" data-full="{{block.settings.before | img_url: '1440x'}}">
                        <img class="spacer" src="{{'switch-spacer.png' | asset_url}}" alt="" />
                    </div>
                </div>
            </div>
            <span class="handle icon-drag"></span>
      </div>
  {% endfor %}
</div>
