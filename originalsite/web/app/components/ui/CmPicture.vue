<template>
  <picture v-if="Array.isArray(responsiveSources)" :key="defaultSource.src">
    <source v-for="source in responsiveSources.reverse()" :media="source.media" :srcset="source.src" />
    <img :src="defaultSource.src" :width="defaultSource.width" :height="defaultSource.height" :class="classes" :loading="loading" :alt="alt" :style="focalPoint ? 'object-position:'+focalPoint+';' : ''" />
  </picture>
  <picture v-else :key="responsiveSources.src">
    <source :media="responsiveSources.media" :srcset="responsiveSources.src" />
    <img :src="responsiveSources.src" :class="classes" :loading="loading" :alt="alt" :style="focalPoint ? 'object-position:'+focalPoint+';' : ''" />
  </picture>
</template>
<script setup>
import {useCheckmateImageProxy} from "~/composables/checkmateImageProxy";
import {useCheckmateCacheKey} from "~/composables/checkmateCacheKey";
import screens from '#tailwind-config/theme/screens';

const { cacheKey: key } = useCheckmateCacheKey();
const props = defineProps({
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
    default() {
      return []
    }
  },
  classes: {
    type: String,
    default: ""
  },
  focalPoint: {
    type: String,
    default: ""
  }
});

const loading = computed(() => {
  return props.lazy ? 'lazy' : 'eager';
});

const alt = computed(() => {
  return props.imageObject.alt ? props.imageObject.alt : '';
});

const getBreakpointWidth = (breakpoint) => {
  screens['default'] = '0px';
  return screens[breakpoint];
}

const validCrops = computed(() => {
  if (!props.imageObject.sizes) {
    return [];
  }
  return props.crops.filter(s => {
    const crop = s.split(':').pop();
    return crop === 'original' || props.imageObject.sizes[crop];
  });
})

const responsiveSources = computed(() => {
  if (validCrops.value.length === 0) {
    return getImgDataFromCrop('original');
  }

  return validCrops.value.map(s => {
    return getImgDataFromCrop(s);
  });
});

const defaultSource = computed(() => {
  const defaultCrop = validCrops.value.find(s => s.includes('default'));
  let cropToUse;
  if (defaultCrop) {
    cropToUse = defaultCrop;
  } else {
    cropToUse = validCrops.value[0];
  }

  return getImgDataFromCrop(cropToUse);
});

const getImgDataFromCrop = (c) => {
  if (!c) {
    return [];
  }
  const breakpoint = c.split(':').shift();
  const crop = c.split(':').pop();
  let imageUrl;
  if (crop === 'original') {
    imageUrl = props.imageObject && props.imageObject.hasOwnProperty('url') ? props.imageObject.url : props.imageObject && props.imageObject.hasOwnProperty('source_url') ? props.imageObject.source_url : null;
    if (!imageUrl) {
      return [];
    }
  } else {
    imageUrl = props.imageObject.sizes[crop];
  }
  const {url} = useCheckmateImageProxy(imageUrl, key.value);
  return {
    src: url,
    width: crop === 'original' ? props.imageObject.width : props.imageObject.sizes[crop + '-width'],
    height: crop === 'original' ? props.imageObject.height : props.imageObject.sizes[crop + '-height'],
    media: `(min-width: ${getBreakpointWidth(breakpoint)})`
  }
}

</script>
