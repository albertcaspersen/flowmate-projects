<template>
  <Head v-if="yoast">
    <Title>{{ title }}</Title>
    <Meta name="description" :content="title" />
  </Head>
</template>

<script setup>
import { onBeforeMount } from 'vue';
import { useCoreStore } from '~/stores/core';

const coreStore = useCoreStore();

const props = defineProps({
  yoast: {
    type: Object,
    default: null,
  },
});

onBeforeMount(() => {
});
</script>