<template>
  <div class="section-container py-8 md:py-16" :class="containerClasses" ref="sectionRef">
    <div class="default-grid">
      <div class="col-span-full md:col-span-8 md:col-start-3 lg:col-start-3 lg:col-span-8 mb-6 md:mb-10" ref="headlineRef">
        <HeadlineFields :data="data" :index="index"></HeadlineFields>
      </div>
    </div>
    <div class="default-grid" ref="gridContainer">
      <!-- Left side (Active demo card) - Main column (9/12) -->
      <div class="col-span-full md:col-span-8 lg:col-span-9 pr-0 md:pr-6" ref="activeCardContainer">
        <div class="active-card-wrapper h-full relative" ref="activeCardWrapper">
          <div 
            v-for="demoPage in demoPages" 
            :key="demoPage.id"
            class="active-card h-full rounded-lg overflow-hidden absolute inset-0 w-full transition-transform duration-500 ease-out"
            :class="{
              'translate-x-0 opacity-100 z-10': demoPage.id === activeCardId,
              'translate-x-[-120%] opacity-0 z-0 inactive-card': demoPage.id !== activeCardId
            }"
            :ref="el => { if (el) activeCardRefs[demoPage.id] = el }"
          >
            <nuxt-link :to="demoPage.post_path" class="block h-full">
              <div class="aspect-[16/9] w-full h-full relative">
                <!-- Video or Image based on what's available -->
                <cm-video 
                  v-if="demoPage.acf && demoPage.acf.featured_video" 
                  :src="demoPage.acf.featured_video.url"
                  classes="w-full h-full object-cover absolute inset-0"
                ></cm-video>
                <cm-picture 
                  v-else-if="demoPage.featured_image_object" 
                  :image-object="demoPage.featured_image_object" 
                  classes="w-full h-full object-cover absolute inset-0"
                />
                <img v-else src="/placeholder/placeholder.jpg" alt="placeholder image" class="w-full h-full object-cover absolute inset-0">
                
                <!-- Card content overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4 md:p-6">
                  <h3 class="text-white text-xl md:text-2xl mb-2">{{ demoPage.title.rendered }}</h3>
                  <div v-if="demoPage.excerpt && demoPage.excerpt.rendered" 
                       class="text-white/80 text-sm md:text-base line-clamp-2 mb-2"
                       v-html="demoPage.excerpt.rendered"></div>
                  <div class="inline-flex items-center text-white text-sm md:text-base">
                    <span>View case</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </nuxt-link>
          </div>
        </div>
      </div>
      
      <!-- Right side (Thumbnail column) - Smaller column (3/12) -->
      <div class="col-span-full md:col-span-4 lg:col-span-3 mt-6 md:mt-0" ref="thumbnailsContainer">
        <div class="thumbnails-wrapper" ref="thumbnailsWrapper">
          <div 
            v-for="demoPage in demoPages" 
            :key="demoPage.id"
            class="thumbnail-card mb-4 cursor-pointer rounded-lg overflow-hidden"
            :data-demo-id="demoPage.id"
            :ref="el => { if (el) thumbnailRefs[demoPage.id] = el }"
            @click="handleCardClick(demoPage)"
          >
            <div class="aspect-[16/9] relative">
              <!-- Video or Image based on what's available -->
              <cm-video 
                v-if="demoPage.acf && demoPage.acf.featured_video" 
                :src="demoPage.acf.featured_video.url"
                classes="w-full h-full object-cover absolute inset-0"
              ></cm-video>
              <cm-picture 
                v-else-if="demoPage.featured_image_object" 
                :image-object="demoPage.featured_image_object"
                classes="w-full h-full object-cover absolute inset-0"
              />
              <img v-else src="/placeholder/placeholder.jpg" alt="placeholder image" class="w-full h-full object-cover absolute inset-0">
              
              <!-- Card title overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                <h5 class="text-white">{{ demoPage.title.rendered }}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFetchMate } from "~/composables/fetchMate";
import { useCheckmateFlexSettings } from "~/composables/checkmateFlexSettings";
import { useGsapAnimations } from "~/composables/useGsapAnimations";
import { onMounted, onBeforeUnmount, ref, computed, watch, nextTick } from "vue";

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

// Demo pages data
const demoPages = ref([]);
const activeCardId = ref(null);
const isTransitioning = ref(false);
const initialAnimationComplete = ref(false);

// Dynamic refs for cards
const activeCardRefs = ref({});
const thumbnailRefs = ref({});

// Container refs
const sectionRef = ref(null);
const gridContainer = ref(null);
const headlineRef = ref(null);
const activeCardContainer = ref(null);
const activeCardWrapper = ref(null);
const thumbnailsContainer = ref(null);
const thumbnailsWrapper = ref(null);

// Store GSAP instances for cleanup
const scrollTriggerInstances = ref([]);
const splitTextInstances = ref([]);
const styleElements = ref([]);
const hoverInstances = ref({});

/**
 * Container classes
 * @type {ComputedRef<*[]>}
 */
const containerClasses = computed(() => {
  let classes = [];
  if (props.data.settings) {
    const { getContainerClasses } = useCheckmateFlexSettings(props.data.settings);
    classes = getContainerClasses('background', 'margin', 'padding', 'width', 'text');
  }
  return classes;
});

// Fetch demo pages
const fetchDemoPages = async () => {
  if (props.data.slider_content && props.data.slider_content.length > 0) {
    const { items } = await useFetchMate(props.data.slider_content);
    if (items.value && items.value.length > 0) {
      demoPages.value = items.value;
      
      // Set the first card as active initially
      activeCardId.value = demoPages.value[0].id;
      
      // Initialize initial animations after data is loaded
      nextTick(() => {
        initializeAnimations();
        setupHoverAnimations();
        
        // Apply initial active thumbnail state
        setTimeout(() => {
          const firstThumbnail = thumbnailRefs.value[activeCardId.value];
          if (firstThumbnail) {
            const { $gsap } = useNuxtApp();
            $gsap.set(firstThumbnail, { opacity: 0.5, scale: 0.95 });
            
            // Also ensure this thumbnail doesn't respond to hover
            if (hoverInstances.value[activeCardId.value]) {
              const current = hoverInstances.value[activeCardId.value];
              current.card.removeEventListener('mouseenter', current.mouseenter);
              current.card.removeEventListener('mouseleave', current.mouseleave);
              
              // Add pointer-events: none to the active thumbnail
              current.card.classList.add('active-thumbnail');
            }
          }
        }, 100);
      });
    }
  }
};

// Helper function to find heading elements inside a container
const findHeadingsInContainer = (container) => {
  if (!container) return { largeHeadings: [], smallHeadings: [] };
  
  const largeHeadings = Array.from(container.querySelectorAll('h1, h2'));
  const smallHeadings = Array.from(container.querySelectorAll('h3, h4, h5, h6'));
  
  return { largeHeadings, smallHeadings };
};

// Helper function to find paragraph elements
const findParagraphsInContainer = (container) => {
  if (!container) return [];
  return Array.from(container.querySelectorAll('p'));
};

// Set up hover animations using GSAP instead of CSS/Tailwind
const setupHoverAnimations = () => {
  if (!thumbnailsContainer.value) return;
  
  const { $gsap } = useNuxtApp();
  const thumbnailCards = Array.from(thumbnailsContainer.value.querySelectorAll('.thumbnail-card'));
  
  // Clear existing hover instances
  Object.values(hoverInstances.value).forEach(instance => {
    if (instance && instance.kill) {
      instance.kill();
    }
  });
  
  // Reset hoverInstances
  hoverInstances.value = {};
  
  // Set up hover animations for each thumbnail card
  thumbnailCards.forEach(card => {
    const demoId = card.getAttribute('data-demo-id');
    if (!demoId) return;
    
    // Skip setting up hover animation for the active card
    if (demoId === activeCardId.value) {
      // Apply active state immediately
      $gsap.set(card, { opacity: 0.5, scale: 0.95 });
      return;
    }
    
    // Create hover animation context
    const hoverContext = {
      card,
      mouseenter: () => {
        if (demoId === activeCardId.value || isTransitioning.value) return;
        
        $gsap.to(card, {
          scale: 1.02,
          x: 5,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          duration: 0.3,
          ease: "power2.out"
        });
      },
      mouseleave: () => {
        if (demoId === activeCardId.value || isTransitioning.value) return;
        
        $gsap.to(card, {
          scale: 1,
          x: 0,
          boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
          duration: 0.3,
          ease: "power2.out"
        });
      }
    };
    
    // Add event listeners
    card.addEventListener('mouseenter', hoverContext.mouseenter);
    card.addEventListener('mouseleave', hoverContext.mouseleave);
    
    // Store for cleanup
    hoverInstances.value[demoId] = hoverContext;
  });
};

// Initialize animations according to the ANIMATIONS.md guide
const initializeAnimations = () => {
  if (!sectionRef.value || initialAnimationComplete.value) return;
  
  const { $gsap, $gsapScrollTrigger, $gsapSplitText } = useNuxtApp();
  const { scrollTriggerAnimation } = useGsapAnimations();
  
  // Add word-wrapping styles to prevent character split issues
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      .word-split {
        display: inline-block;
        white-space: nowrap;
        margin-right: 0.1em;
      }
      .char-split {
        display: inline-block;
        position: relative;
      }
    `;
    document.head.appendChild(style);
    styleElements.value.push(style);
  }
  
  // Define scroll trigger configuration
  const scrollConfig = {
    trigger: sectionRef.value,
    start: "top 80%",
    end: "bottom 20%",
    toggleActions: "play none none none",
  };
  
  // Create a timeline for initial animations
  const timeline = $gsap.timeline();
  
  // Find and animate headings in the HeadlineFields component
  if (headlineRef.value) {
    const { largeHeadings, smallHeadings } = findHeadingsInContainer(headlineRef.value);
    
    // Character animation for large headings (h1, h2)
    largeHeadings.forEach(heading => {
      const splitText = new $gsapSplitText(heading, { 
        type: "words,chars", 
        charsClass: "char-split",
        wordsClass: "word-split"
      });
      splitTextInstances.value.push(splitText);
      
      timeline.fromTo(
        splitText.chars,
        { opacity: 0, y: 15, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)", stagger: 0.02 },
        0
      );
    });
    
    // Line animation for small headings (h3-h6)
    smallHeadings.forEach(heading => {
      const splitText = new $gsapSplitText(heading, { type: "lines" });
      splitTextInstances.value.push(splitText);
      
      timeline.fromTo(
        splitText.lines,
        { opacity: 0, y: 20, rotationX: -45 },
        { opacity: 1, y: 0, rotationX: 0, duration: 0.8, ease: "power3.out", stagger: 0.05 },
        0.3
      );
    });
  }
  
  // Animate the active card container with a fade up
  if (activeCardContainer.value) {
    timeline.fromTo(
      activeCardContainer.value,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
      0.5
    );
  }
  
  // Animate thumbnails with a staggered effect
  if (thumbnailsContainer.value) {
    // Get all thumbnail cards
    const thumbnailCards = Array.from(thumbnailsContainer.value.querySelectorAll('.thumbnail-card'));
    
    if (thumbnailCards.length > 0) {
      timeline.fromTo(
        thumbnailCards,
        { opacity: 0, x: 30 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.5, 
          stagger: 0.1, 
          ease: "power2.out" 
        },
        0.7
      );
    }
  }
  
  // Apply scroll trigger to the timeline
  const trigger = scrollTriggerAnimation(sectionRef.value, timeline, scrollConfig);
  if (trigger) scrollTriggerInstances.value.push(trigger);
  
  // Mark initial animation as complete
  initialAnimationComplete.value = true;
};

// Handle card click to make it the active card with GSAP animations
const handleCardClick = (demoPage) => {
  if (isTransitioning.value || demoPage.id === activeCardId.value) return;
  
  isTransitioning.value = true;
  
  const { $gsap } = useNuxtApp();
  
  // Get previous active card ID
  const prevActiveId = activeCardId.value;
  
  // Update active card ID
  activeCardId.value = demoPage.id;
  
  // Animate the transition with GSAP
  
  // 1. Update the previous active thumbnail (restore normal state)
  if (prevActiveId && thumbnailRefs.value[prevActiveId]) {
    $gsap.to(thumbnailRefs.value[prevActiveId], {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: "power2.out"
    });
    
    // Re-enable hover for previously active card
    if (hoverInstances.value[prevActiveId]) {
      const prev = hoverInstances.value[prevActiveId];
      prev.card.addEventListener('mouseenter', prev.mouseenter);
      prev.card.addEventListener('mouseleave', prev.mouseleave);
      
      // Remove pointer-events: none from the previously active thumbnail
      prev.card.classList.remove('active-thumbnail');
    }
  }
  
  // 2. Update the new active thumbnail (apply active state)
  if (thumbnailRefs.value[demoPage.id]) {
    $gsap.to(thumbnailRefs.value[demoPage.id], {
      opacity: 0.5,
      scale: 0.95,
      duration: 0.4,
      ease: "power2.out"
    });
    
    // Disable hover for newly active card
    if (hoverInstances.value[demoPage.id]) {
      const current = hoverInstances.value[demoPage.id];
      current.card.removeEventListener('mouseenter', current.mouseenter);
      current.card.removeEventListener('mouseleave', current.mouseleave);
      
      // Add pointer-events: none to the active thumbnail
      current.card.classList.add('active-thumbnail');
    }
  }
  
  // Reset transition state after animation completes
  setTimeout(() => {
    isTransitioning.value = false;
  }, 500); // Match duration in the transition class
};

// Watch for changes in active card to ensure cards are in view
watch(activeCardId, (newVal, oldVal) => {
  if (newVal && thumbnailRefs.value[newVal]) {
    // Ensure the thumbnail is in view
    nextTick(() => {
      thumbnailRefs.value[newVal].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest'
      });
    });
  }
});

onMounted(() => {
  // Fetch demo pages immediately on mount
  fetchDemoPages();
});

// Clean up when component is unmounted
onBeforeUnmount(() => {
  // Kill all ScrollTrigger instances to prevent memory leaks
  scrollTriggerInstances.value.forEach(trigger => {
    if (trigger && trigger.kill) {
      trigger.kill();
    }
  });
  
  // Revert all SplitText instances
  splitTextInstances.value.forEach(splitText => {
    if (splitText && splitText.revert) {
      splitText.revert();
    }
  });
  
  // Clean up hover animations
  Object.values(hoverInstances.value).forEach(instance => {
    if (instance && instance.card) {
      instance.card.removeEventListener('mouseenter', instance.mouseenter);
      instance.card.removeEventListener('mouseleave', instance.mouseleave);
    }
  });
  
  // Remove any dynamically created style elements
  styleElements.value.forEach(style => {
    if (style && style.parentNode) {
      style.parentNode.removeChild(style);
    }
  });
});

// Call fetch on component setup
fetchDemoPages();
</script>

<style scoped>
/* Active card styling */
.active-card {
  transition: transform 0.5s ease-out, opacity 0.5s ease-out;
  backface-visibility: hidden;
  will-change: transform, opacity;
}

.active-card-wrapper {
  position: relative;
}

/* Inactive card styling - prevents interaction with offscreen cards */
.inactive-card {
  pointer-events: none !important;
}

/* Active thumbnail styling - prevents hover interaction on active thumbnails */
.active-thumbnail {
  pointer-events: none !important;
  cursor: default !important;
}

/* Ensure proper aspect ratio maintenance */
.aspect-\[16\/9\] {
  position: relative;
}

.aspect-\[16\/9\]::before {
  content: "";
  display: block;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
}

.aspect-\[16\/9\] > *:not(.absolute) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Use default-grid class to set up the 12-column grid */
.default-grid {
  @apply grid grid-cols-12 gap-4 md:gap-6;
}
</style>
