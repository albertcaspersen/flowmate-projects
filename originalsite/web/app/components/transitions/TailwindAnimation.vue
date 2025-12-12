<template>
  <div
      ref="observerElement"
      :class="[isVisible ? animationClass : 'opacity-0', '']">
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
// Props
const props = defineProps({
  /**
   * Tailwind animation class to apply when the element is visible.
   * Default: 'animate-fadeIn'
   */
  animationClass: {
    type: String,
    default: "",
  },
  /**
   * Intersection Observer root margin.
   * Default: 0px 0px -15% 0px (15% from the top of the element must be in view)
   */
  rootMargin: {
    type: Number,
    default: "0px 0px -15% 0px"
  },
});
const observerElement = ref(null); // Element to observe
const isVisible = ref(false); // Visibility state
let observer = null; // Intersection Observer instance
// Observer callback
const observeElement = ([entry]) => {
  if (entry.isIntersecting) {
    isVisible.value = true;
    observer.unobserve(entry.target); // Stop observing once visible
  }
};

// Lifecycle hooks
onMounted(() => {
  observer = new IntersectionObserver(observeElement, {
    threshold: 0,
    rootMargin: props.rootMargin
  });
  if (observerElement.value) observer.observe(observerElement.value);
});
onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});
</script>
