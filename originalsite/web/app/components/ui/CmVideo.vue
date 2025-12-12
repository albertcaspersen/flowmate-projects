<template>
  <div class="relative">
    <video ref="video" :class="props.classes" :key="videoSource" autoplay muted loop playsinline>
      <slot>
        <source v-if="videoSource" :src="videoSource" type="video/mp4">
      </slot>
    </video>
    <!-- <div class="absolute z-10 bottom-3 right-3">
      <button aria-label="Pause video" class="p-2" @click="pauseVideo" v-show="!videoIsPaused">
        <svg class="w-4 h-4" width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="9" y1="4.37114e-08" x2="9" y2="12" stroke="currentColor" stroke-width="2"/>
          <line x1="1" y1="4.37114e-08" x2="0.999999" y2="12" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>

      <button aria-label="Play video" class="p-2" @click="playVideo" v-show="videoIsPaused">
        <svg class="w-4 h-4" width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 7L0.25 13.0622L0.250001 0.937822L10 7Z" fill="currentColor"/>
        </svg>
      </button>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import {useCheckmateImageProxy} from "~/composables/checkmateImageProxy";
const props = defineProps({
  src: {
    type: String,
    default: null
  },
  index: {
    type: Number,
    default: null
  },
  classes: {
    type: String,
    default: ''
  },
});

const videoSource = computed(() => {
  if (!props.src) {
    return null;
  }
  const {url} = useCheckmateImageProxy(props.src);
  return url;
});

const videoIsPaused = ref(false);
const video = ref();
const pauseVideo = () => {
  video.value.pause();
  videoIsPaused.value = true;
}

const playVideo = () => {
  video.value.play();
  videoIsPaused.value = false;
}
</script>
