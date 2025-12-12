<template>
  <div class="section-container py-8 md:py-16" :class="containerClasses" ref="sectionRef">
    <div class="default-grid">
      <div :class="!isInSbs && data.settings.column_width === 'narrow' ? 'md:col-start-3 md:col-span-8' : ''" class="col-span-full" ref="imageContainer">
        <lazy-cm-picture v-if="data.image" :image-object="data.image" classes="w-full rounded-lg" :crops="['default:large', 'lg:1536x1536']" />
      </div>
    </div>
  </div>
</template>
<script setup>
import {useCheckmateFlexSettings} from "~/composables/checkmateFlexSettings";
import { useGsapAnimations } from "~/composables/useGsapAnimations";
import { onMounted, onBeforeUnmount, ref } from "vue";

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

// Animation refs
const sectionRef = ref(null);
const imageContainer = ref(null);

// Store ScrollTrigger instances for cleanup
const scrollTriggerInstances = ref([]);

/**
 * Container classes
 * @type {ComputedRef<*[]>}
 */
const containerClasses = computed (() => {
  let classes = [];
  if (props.data.settings) {
    const { getContainerClasses } = useCheckmateFlexSettings(props.data.settings);
    classes = getContainerClasses('background', 'margin', 'padding', 'width', 'text');
  }
  return classes;
});

// Set up animations when the component is mounted
onMounted(() => {
  if (!sectionRef.value || !imageContainer.value) return;
  
  const { $gsap } = useNuxtApp();
  const { scrollTriggerAnimation } = useGsapAnimations();
  
  // Define scroll trigger configuration
  const scrollConfig = {
    trigger: sectionRef.value,
    start: "top 80%",
    end: "bottom 20%",
    toggleActions: "play none none none",
  };
  
  // Create a timeline for animations
  const timeline = $gsap.timeline();
  
  // Add a simple fade-in and slight scale animation for the image
  timeline.fromTo(
    imageContainer.value,
    { 
      opacity: 0, 
      scale: 0.95,
      y: 20
    },
    { 
      opacity: 1, 
      scale: 1,
      y: 0,
      duration: 1, 
      ease: "power2.out"
    }
  );
  
  // Apply scroll trigger to the timeline
  const trigger = scrollTriggerAnimation(sectionRef.value, timeline, scrollConfig);
  if (trigger) scrollTriggerInstances.value.push(trigger);
});

// Clean up instances when the component is unmounted
onBeforeUnmount(() => {
  // Kill all ScrollTrigger instances to prevent memory leaks
  scrollTriggerInstances.value.forEach(trigger => {
    if (trigger && trigger.kill) {
      trigger.kill();
    }
  });
});
</script>
