<template>
  <swiper-container :id="'swiper-' + props.blockIndex" init="false">
    <slot></slot>
  </swiper-container>
</template>

<script setup>
import { register } from "swiper/element/bundle";
import { onMounted } from 'vue';
register();

const props = defineProps({
  options: {
    type: Object,
    default: () => ({})
  },
  blockIndex: {
    type: Number,
    default: null
  }
});

onMounted(() => {
  const swiperEl = document.querySelector('swiper-container#swiper-' + props.blockIndex);
  if(swiperEl) {
    Object.assign(swiperEl, props.options);
    swiperEl.initialize();
  }
});
</script>

<!-- <template>
    <swiper-container :id="'swiper-' + props.blockIndex" init="false">
      <slot></slot>
    </swiper-container>
  </template>
  <script setup>
  import { register } from "swiper/element/bundle";
  register();
  const props = defineProps({
    options: {
      type: Object,
      default: () => ({})
    },
    blockIndex: {
      type: Number,
      default: null
    }
  });
  onMounted(() => {
    const swiperEl = document.querySelector('swiper-container#swiper-' + props.blockIndex);
    if(swiperEl) {
      Object.assign(swiperEl, props.options);
      swiperEl.initialize();
    }
  })
  </script>
   -->