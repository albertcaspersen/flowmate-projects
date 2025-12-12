<template>
  <div class="section-container py-8 md:py-16" :class="containerClasses">
    <div class="default-grid">
      <div :class="!isInSbs && data.settings.column_width === 'narrow' ? 'md:col-start-3 md:col-span-8' : ''" class="col-span-full">
        <cm-video v-if="data.settings.video_type === 'file' && data.video_file" :src="data.video_file.url" :classes="'rounded-lg'"></cm-video>
        <div v-else-if="data.settings.video_type === 'url' && data.video_embed" class="w-full h-auto rounded-lg" v-html="data.video_embed"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {useCheckmateFlexSettings} from "~/composables/checkmateFlexSettings";
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  index: {
    type: Number,
    default: null,
  },
  isInSbs: {
    type: Boolean,
    default: false,
  },
});
/**
 * Container classes
 * @type {ComputedRef<*[]>}
 */
const containerClasses  = computed (() => {
  let classes = [];
  if (props.data.settings) {
    const { getContainerClasses } = useCheckmateFlexSettings(props.data.settings);
    classes = getContainerClasses('background', 'margin', 'padding', 'width', 'text');
  }
  return classes;
});
</script>
