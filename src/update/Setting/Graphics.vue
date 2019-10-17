<template>
            <li class="geofs-list-collapsible-item">
                Graphics
                <div class="geofs-collapsible">
                    <fieldset>
                        <legend class="geofs-hideForApp">Performance vs. Quality - Anything above 3 requires a fast computer and may slow down the simulation considerably
                        </legend>
                        <legend class="geofs-onlyForApp">Performance vs. Quality - (resolution, viewing distance, amount of clouds, ...)
                        </legend>
                        <div title="Quality Level" class="slider span2" type="slider" gespref="geofs.preferences.graphics.quality" update="geofs.api.renderingQuality" value="3" min="1" max="5" precision="0">
                            <div class="slider-rail">
                                <div class="slider-selection">
                                    <div class="slider-grippy">
                                        <input class="slider-input" />
                                    </div>
                                </div>
                            </div>
                            <label>Quality Level</label>
                        </div>
                        <legend>Color enhancement
                        </legend>
                        <div title="Color enhancement" class="slider span2" type="slider" gespref="geofs.preferences.graphics.enhanceColors" update="geofs.api.enhanceColors" value="0" min="0" max="1.4" precision="1">
                            <div class="slider-rail">
                                <div class="slider-selection">
                                    <div class="slider-grippy">
                                        <input class="slider-input" />
                                    </div>
                                </div>
                            </div>
                            <label>Enhancement Level</label>
                        </div>
                        <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect geofs-hideForApp" for="simpleShadow" title="Force Simple Shadows">
                                <input type="checkbox" id="simpleShadow" class="mdl-switch__input" gespref="geofs.preferences.graphics.forceSimpleShadow" update="geofs.api.renderingQuality();"/>
                                <span class="mdl-switch__label">Force simple shadows (faster)</span>
                            </label>
                        <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect .geofs-onlyForSubscribers" for="hdonoff" title="Enable HD images">
                                <input type="checkbox" id="hdonoff" class="mdl-switch__input" gespref="geofs.preferences.graphics.HD" update="if (geofs.preferences.graphics.HD==this.checked) geofs.api.setHD(this.checked);">
                                <span class="mdl-switch__label">Enable HD</span>
                            </label>
                        <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="headMotion" title="Enable head acceleration motion">
                                <input type="checkbox" id="headMotion" class="mdl-switch__input" gespref="geofs.preferences.camera.headMotion">
                                <span class="mdl-switch__label">Cockpit view head motion</span>
                            </label>
                        <div class="geofs-HDPurchase-view geofs-hideForApp"></div>
                        <div class="geofs-hdTrial-view geofs-hideForApp" style="position: relative;">
                            <div class="geofs-trial-frame">
                                <h5>Try HD, free, for a day!</h5>
                                <p>
                                    Before purchasing a subscription, try HD satellite images <b>free</b> for one-day.
                                </p>
                                <div style="text-align: center;">
                                    <h6 class="geofs-notification geofs-info">
                                        <i class="material-icons">&#xE88E;</i> You need to be logged-in in order to start the one-day free trial
                                    </h6>
                                    <a class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent mdl-js-ripple-effect" href="#" disabled>Start free one-day HD trial</a>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                </div>
            </li>
</template>

<script>
export default {
  name: 'Graphics',
  data() {
    return {
    
    };
  },
  created() {

  },
};

</script>



