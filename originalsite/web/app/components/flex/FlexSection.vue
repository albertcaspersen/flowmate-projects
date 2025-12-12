<template>
  <section 
    class="flex-section" 
    :class="[containerStylesObj.class, index === 0 && !['block_hero', 'block_showcase_hero'].includes(layout) ? 'pt-[10vh]' : '', layout === 'block_zoomy_slider' ? 'overflow-hidden' : '']" 
    :style="containerStylesObj.style" 
    :data-index="index">
    <slot></slot>
  </section>
</template>
<script setup>
import {useCheckmateFlexSettings} from "~/composables/checkmateFlexSettings";

const props = defineProps({
  layout: {
    type: String,
    default: '',
  },
  data: {
    type: Object,
    default: () => ({}),
  },
  index: {
    type: Number,
    default: 0,
  },
  spacing: {
    type: Boolean,
    default: true,
  },
  classes: {
    type: String,
    default: '',
  },
  bg: {
    type: String,
    default: 'white',
  },
  paddingSettings: {
    type: Array,
    default: () => [],
  },
});

const containerStylesObj = computed(() => {
  if (props.data.settings) {
    const { getContainerStyles } = useCheckmateFlexSettings(props.data.settings);
    return getContainerStyles('background', 'text');
  }
  // Return default empty structure if no settings
  return {
    style: '',
    class: ''
  };
})

const containerStyles = computed(() => {
  return containerStylesObj.value.style;
});
</script>
