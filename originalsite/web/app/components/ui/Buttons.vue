<template>
  <div class="flex flex-wrap items-center gap-6 mt-8" v-if="props.data.buttons">
    <link-button 
      v-for="(button, bIndex) in props.data.buttons" 
      :key="'text-btn-'+bIndex" 
      :button="button"
    ></link-button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});
</script>
