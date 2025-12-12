<template>
  <div class="section-container py-8 md:py-16" :class="containerClasses" ref="sectionRef">
    <div class="default-grid !gap-y-8 !md:gap-y-12" ref="gridContainer">
      <div class="col-span-6 md:col-span-4 group archive-item" v-for="demoPage in demoPages" :ref="el => { if (el) archiveItemRefs.push(el) }">
        <nuxt-link :to="demoPage.post_path">
          <div class="aspect-square">
            <!-- TODO: add featured media type-->
            <cm-video v-if="demoPage.acf.featured_video" :src="demoPage.acf.featured_video.url"></cm-video>
            <cm-picture v-else-if="demoPage.featured_image_object" :image-object="demoPage.featured_image_object" classes="w-full h-full object-cover" />
            <img v-else src="/placeholder/placeholder.jpg" alt="placeholder image archive">
          </div>

          <div class="mt-2 group-hover:translate-x-2 duration-300 transition">
            <h6>{{ demoPage.title.rendered }}</h6>
          </div>

        </nuxt-link>

      </div>

    </div>
  </div>
</template>

<script setup>
import { useFetchMate } from "~/composables/fetchMate";
import { useCheckmateFlexSettings } from "~/composables/checkmateFlexSettings";
import { useGsapAnimations } from "~/composables/useGsapAnimations";
import { onMounted, onBeforeUnmount, ref, computed, nextTick, watch } from "vue";

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  index: {
    type: Number,
    default: null,
  },
});

// Animation refs
const sectionRef = ref(null);
const gridContainer = ref(null);
const archiveItemRefs = ref([]);

// Store ScrollTrigger instances for cleanup
const scrollTriggerInstances = ref([]);
// Store SplitText instances for cleanup
const splitTextInstances = ref([]);

const demoPages = ref([]);
const demoPagesLoaded = ref(false);

const fetchDemoPages = async () => {
  if(props.data.archive_content && props.data.archive_content.length > 0) {
    const {items} = await useFetchMate(props.data.archive_content);
    if (items.value) {
      demoPages.value = items.value;
      demoPagesLoaded.value = true;
    }
  }
};

const containerClasses = computed (() => {
  let classes = [];
  if (props.data.settings) {
    const { getContainerClasses } = useCheckmateFlexSettings(props.data.settings);
    classes = getContainerClasses('background', 'margin', 'padding', 'width', 'text');
  }
  return classes;
});

// Watch for changes in demo pages data
watch(demoPages, async (newVal) => {
  if (newVal.length > 0) {
    // Wait for DOM to update with new data before initializing animations
    await nextTick();
    // Initialize animations after data is loaded and DOM is updated
    setupAnimations();
  }
}, { deep: true });

// Initialize animations
const setupAnimations = () => {
  if (!sectionRef.value || archiveItemRefs.value.length === 0) return;
  
  const { $gsap, $gsapScrollTrigger } = useNuxtApp();
  const { scrollTriggerAnimation } = useGsapAnimations();
  
  // Define scroll trigger configuration
  const scrollConfig = {
    trigger: sectionRef.value,
    start: "top 80%",
    end: "bottom 20%",
    toggleActions: "play none none none",
  };
  
  // Create a timeline for animations
  const timeline = $gsap.timeline({ paused: true });
  
  // Set initial state for all items - hidden
  $gsap.set(archiveItemRefs.value, { 
    opacity: 0, 
    y: 50, 
    scale: 0.9
  });
  
  // Add staggered fade in for archive items
  timeline.to(
    archiveItemRefs.value,
    { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      duration: 0.8, 
      ease: "power3.out", 
      stagger: { 
        amount: 0.8, // Total stagger time
        grid: "auto", // Auto-detect grid layout
        from: "start" 
      }
    }
  );
  
  // Apply scroll trigger to the timeline
  const trigger = scrollTriggerAnimation(sectionRef.value, timeline, scrollConfig);
  if (trigger) scrollTriggerInstances.value.push(trigger);
};

// Clean up instances when the component is unmounted
onBeforeUnmount(() => {
  // Kill all ScrollTrigger instances to prevent memory leaks
  scrollTriggerInstances.value.forEach(trigger => {
    if (trigger && trigger.kill) {
      trigger.kill();
    }
  });
  
  // Revert any SplitText instances
  splitTextInstances.value.forEach(splitText => {
    if (splitText && splitText.revert) {
      splitText.revert();
    }
  });
});

// Fetch demo pages data
fetchDemoPages();

// Set up animations when component is mounted
onMounted(() => {
  // Check if data is already loaded
  if (demoPages.value.length > 0) {
    nextTick(() => {
      setupAnimations();
    });
  }
});
</script>

<style scoped>
/* Add styles for the animation */
.archive-item {
  will-change: transform, opacity;
  transition: transform 0.3s ease-out;
}

.archive-item:hover {
  transform: translateY(-5px);
}

/* Grid layout */
.default-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 768px) {
  .default-grid {
    gap: 1.5rem;
  }
}
</style>

