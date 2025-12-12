<template>
  <picture v-if="imageSources">
    <source v-for="source in imageSources" :media="source.media" :srcset="source.src" />
    <img :src="defaultImage.src" :width="defaultImage.width" :height="defaultImage.height" :class="classes" :loading="loading" :alt="imageAlt" />
  </picture>
</template>
<script>
import {useCheckmateImageProxy} from "~/composables/checkmateImageProxy";
import {useCheckmateCacheKey} from "~/composables/checkmateCacheKey";

export default {
  props: {
    lazy: {
      type: Boolean,
      default: true
    },
    imageObject: {
      type: Object,
      default: null
    },
    crops: {
      type: Array,
      default () {
        return ['card_medium']
      }
    },
    mediaRules: {
      type: String,
      default: "max",
      validate: function (value) {
        return ['min', 'max'].indexOf(value) !== -1;
      }
    },
    classes: {
      type: String,
      default: ""
    }
  },
  mounted() {
    // console.log("IMAGE OBJ", this.imageObject);
  },
  computed: {
    loading () {
      return this.lazy ? 'lazy' : 'eager';
    },
    imageSources() {

      const { cacheKey: key } = useCheckmateCacheKey();

      if (this.validCrops.length === 0) {

        const imageUrl = this.imageObject && this.imageObject.hasOwnProperty('url') ? this.imageObject.url : this.imageObject && this.imageObject.hasOwnProperty('source_url') ? this.imageObject.source_url : null;
        if (!imageUrl) {
          return [];
        }
        const {url} = useCheckmateImageProxy(imageUrl, key.value);

        return [
          {
            src: url,
            width: this.imageObject.width,
            height: this.imageObject.height,
            media: `(${this.mediaRules}-width: ${this.imageObject.width}px)`
          }
        ];
      }
      if(this.imageObject && this.imageObject.sizes) {
        // Create array with image sources based on the specified crops.
        return this.validCrops.filter(s => {
          // Skip if the corp is not available.
          if (!this.imageObject.sizes.hasOwnProperty(s)) {
            return false;
          }
          return s;
        }).map(s => {
          const {url} = useCheckmateImageProxy(this.imageObject.sizes[s], key.value);
          return {
            src: url,
            width: this.imageObject.sizes[s + '-width'],
            height: this.imageObject.sizes[s + '-height'],
            media: `(${this.mediaRules}-width: ${this.imageObject.sizes[s + '-width']}px)`
          }
        });
      } else {
        return [];
      }
    },
    validCrops(){
      return this.crops.filter(s => {
        return this.imageObject.sizes[s];
      });
    },
    defaultImage() {
      // Returns the last image in the imageSources array.
      return this.imageSources[this.imageSources.length - 1];
    },

    imageAlt() {
      if (this.imageObject.hasOwnProperty('alt')) {
        return this.imageObject.alt;
      } else if (this.imageObject.hasOwnProperty('alt_text')) {
        return this.imageObject.alt_text;
      }
      return '';
    }

  },
}
</script>
