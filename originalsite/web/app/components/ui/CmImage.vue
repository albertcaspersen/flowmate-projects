<template>
  <img :src="imageSource" :loading="loading" :alt="alt" :title="title" />
</template>

<script setup>
import { useCheckmateImageProxy } from '~/composables/checkmateImageProxy';
import { ref, computed } from 'vue';

const props = defineProps({
  lazy: {
    type: Boolean,
    default: true,
  },
  src: {
    type: String,
  },
  alt: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
});

const loading = computed(() => props.lazy ? 'lazy' : 'eager');
const { url } = useCheckmateImageProxy(props.src);
const imageSource = ref(url);
</script>