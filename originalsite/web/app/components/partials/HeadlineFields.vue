<template>
  <div class="flex flex-col gap-5">
    <p class="!mb-0" v-if="data.hasOwnProperty('eyebrow') && data.eyebrow" v-html="data.eyebrow"></p>
    <Component :is="index === 0 ? 'h1' : 'h2'" :class="alwaysBig ? 'h1' : 'h2'" class="!mb-0" v-if="data.hasOwnProperty('header') && data.header">
      <span v-html="data.header"></span>
    </Component>
    <h6 class="!mb-0" v-if="data.hasOwnProperty('subheader') && data.subheader" v-html="data.subheader"></h6>
  </div>
</template>
<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  alwaysBig: {
    type: Boolean,
    default: false,
  },
  index: {
    type: Number,
    default: -1,
  }
});
</script>
