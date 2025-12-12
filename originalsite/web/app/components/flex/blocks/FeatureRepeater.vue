<template>
  <div class="section-container py-8 md:py-16" :class="containerClasses" ref="sectionRef">
    <div class="default-grid">
      <div class="col-span-full" :class="data.settings && data.settings.content_span && data.settings.content_span === 'wide' ? 'md:col-span-10 md:col-start-2' : 'md:col-span-8 md:col-start-3 lg:col-start-4 lg:col-span-6'" ref="headlineRef">
        <HeadlineFields class="text-center" :data="data" :index="index"></HeadlineFields>
      </div>
      
      <div class="col-span-full mt-8 md:mt-12" ref="featuresContainerRef">
        <!-- Features grid -->
        <div :class="[
          'grid gap-8 md:gap-10',
          featuresGridClass
        ]">
          <div v-for="(feature, featureIdx) in features" 
               :key="featureIdx" 
               class="feature-item flex flex-col items-center"
               :ref="el => { if (el) featureElements[featureIdx] = el }">
            <div class="feature-icon mb-4" :ref="el => { if (el) featureIcons[featureIdx] = el }">
              <cm-picture v-if="feature.icon" 
                          :image-object="feature.icon" 
                          classes="w-16 h-16 object-contain">
              </cm-picture>
            </div>
            <div class="feature-content text-center">
              <h4 class="mb-2" :ref="el => { if (el) featureHeaders[featureIdx] = el }">{{ feature.header }}</h4>
              <div class="feature-text" v-html="feature.text" :ref="el => { if (el) featureTexts[featureIdx] = el }"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-span-full mt-8 text-center flex justify-center" v-if="data.buttons && data.buttons.length > 0" ref="buttonWrapper">
        <Buttons :data="data"></Buttons>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCheckmateFlexSettings } from "~/composables/checkmateFlexSettings";
import { useGsapAnimations } from "~/composables/useGsapAnimations";
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

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

// Container classes
const containerClasses = computed(() => {
  let classes = [];
  if (props.data.settings) {
    const { getContainerClasses } = useCheckmateFlexSettings(props.data.settings);
    classes = getContainerClasses('background', 'margin', 'padding', 'width', 'text');
  }
  return classes;
});

// Features array from props
const features = computed(() => {
  return props.data.features || [];
});

// Determine grid layout based on the number of features
const featuresGridClass = computed(() => {
  const count = features.value.length;
  
  if (count === 1) {
    return 'grid-cols-1 max-w-lg mx-auto';
  } else if (count === 2) {
    return 'grid-cols-1 md:grid-cols-2 md:justify-between';
  } else if (count === 3) {
    return 'grid-cols-1 md:grid-cols-3';
  } else if (count === 4) {
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  } else {
    // For 5 or more items, use a responsive grid
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  }
});

// Animation references
const sectionRef = ref(null);
const headlineRef = ref(null);
const featuresContainerRef = ref(null);
const featureElements = ref([]);
const featureIcons = ref([]);
const featureHeaders = ref([]);
const featureTexts = ref([]);
const buttonWrapper = ref(null);

// Store animation instances for cleanup
const scrollTriggerInstances = ref([]);
const splitTextInstances = ref([]);
const styleElements = ref([]);

// Define animation configurations
const animationConfigs = {
  splitLines: {
    from: { opacity: 0, y: 20, rotationX: -45 },
    to: { opacity: 1, y: 0, rotationX: 0, duration: 0.8, ease: "power3.out", stagger: 0.05 }
  },
  splitChars: {
    from: { opacity: 0, y: 15, scale: 0.9 },
    to: { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)", stagger: 0.02 }
  },
  iconAnimation: {
    from: { opacity: 0, y: 30, scale: 0.8 },
    to: { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power2.out" }
  }
};

// Helper function to find paragraph elements
const findParagraphsInContainer = (container) => {
  if (!container) return [];
  return Array.from(container.querySelectorAll('p'));
};

// Setup animations
onMounted(() => {
  if (!sectionRef.value) return;
  
  const { $gsap, $gsapScrollTrigger, $gsapSplitText } = useNuxtApp();
  const { fadeUp, scrollTriggerAnimation, staggerAnimation } = useGsapAnimations();
  
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
    start: "top 80%", // Start animation when the top of the element reaches 80% from the top of the viewport
    end: "bottom 20%",
    toggleActions: "play none none none", // Play on enter, don't do anything on leave
  };
  
  // Create the main timeline for all animations
  const mainTimeline = $gsap.timeline({ paused: true });
  
  // Headline animations
  if (headlineRef.value) {
    // Find heading elements
    const largeHeadings = Array.from(headlineRef.value.querySelectorAll('h1, h2'));
    const smallHeadings = Array.from(headlineRef.value.querySelectorAll('h3, h4, h5, h6'));
    
    // Animate large headings with character split
    largeHeadings.forEach(heading => {
      const splitText = new $gsapSplitText(heading, { 
        type: "words,chars", 
        charsClass: "char-split",
        wordsClass: "word-split"
      });
      splitTextInstances.value.push(splitText);
      
      mainTimeline.add(
        $gsap.fromTo(
          splitText.chars,
          animationConfigs.splitChars.from,
          animationConfigs.splitChars.to
        ), 
        0
      );
    });
    
    // Animate small headings with line split
    smallHeadings.forEach(heading => {
      const splitText = new $gsapSplitText(heading, { type: "lines" });
      splitTextInstances.value.push(splitText);
      
      mainTimeline.add(
        $gsap.fromTo(
          splitText.lines,
          animationConfigs.splitLines.from,
          animationConfigs.splitLines.to
        ),
        0.2
      );
    });
  }
  
  // Feature elements - staggered animation
  if (featureElements.value.length > 0) {
    // Set initial state - hide all features
    $gsap.set(featureElements.value, { 
      opacity: 0, 
      y: 50
    });
    
    // Staggered feature elements animation
    mainTimeline.add(
      $gsap.to(featureElements.value, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        clearProps: "transform,opacity" // Clear props to avoid conflicts with hover effect
      }),
      0.4 // Start after headline animations
    );
  }
  
  // Feature icons - slide/fade up animation
  if (featureIcons.value.length > 0) {
    // Set initial state
    $gsap.set(featureIcons.value, animationConfigs.iconAnimation.from);
    
    // Stagger animation for icons
    mainTimeline.add(
      $gsap.to(featureIcons.value, {
        ...animationConfigs.iconAnimation.to,
        stagger: 0.1,
        clearProps: "transform,opacity,scale" // Clear props to allow hover effects
      }),
      0.5 // Slightly delayed to create cascade effect
    );
  }
  
  // Feature headers - line split animation
  featureHeaders.value.forEach((header, index) => {
    if (header) {
      const splitText = new $gsapSplitText(header, { type: "lines" });
      splitTextInstances.value.push(splitText);
      
      mainTimeline.add(
        $gsap.fromTo(
          splitText.lines,
          animationConfigs.splitLines.from,
          { 
            ...animationConfigs.splitLines.to,
            delay: 0.05 * index // Slight delay based on index for natural staggering
          }
        ),
        0.6 + (0.05 * index) // Staggered timing based on index
      );
    }
  });
  
  // Feature text paragraphs - line split animation
  featureTexts.value.forEach((textEl, index) => {
    if (textEl) {
      const paragraphs = findParagraphsInContainer(textEl);
      
      if (paragraphs.length > 0) {
        paragraphs.forEach(paragraph => {
          const splitText = new $gsapSplitText(paragraph, { type: "lines" });
          splitTextInstances.value.push(splitText);
          
          mainTimeline.add(
            $gsap.fromTo(
              splitText.lines,
              animationConfigs.splitLines.from,
              { 
                ...animationConfigs.splitLines.to,
                delay: 0.05 * index // Very slight delay per feature
              }
            ),
            0.7 + (0.05 * index) // Staggered based on which feature it belongs to
          );
        });
      }
    }
  });
  
  // Button animation - fade up
  if (buttonWrapper.value) {
    // Set initial state
    $gsap.set(buttonWrapper.value, { opacity: 0, y: 20 });
    
    // Fade up animation
    mainTimeline.add(
      $gsap.to(buttonWrapper.value, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }),
      0.9 // Start after all other animations are mostly complete
    );
  }
  
  // Create scroll trigger for the main timeline
  const mainScrollTrigger = scrollTriggerAnimation(sectionRef.value, mainTimeline, scrollConfig);
  if (mainScrollTrigger) scrollTriggerInstances.value.push(mainScrollTrigger);
});

// Clean up animations on unmount
onBeforeUnmount(() => {
  // Kill all ScrollTrigger instances
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
  
  // Remove any dynamically created style elements
  styleElements.value.forEach(style => {
    if (style && style.parentNode) {
      style.parentNode.removeChild(style);
    }
  });
});
</script>

<style scoped>
.feature-item {
  /* Remove the transition that enables hover effect */
}

/* Remove the hover transformation */
.feature-item:hover {
  transform: none;
}

/* Add responsive styles as needed */
@media (max-width: 767px) {
  .feature-item {
    margin-bottom: 2rem;
  }
}
</style>
