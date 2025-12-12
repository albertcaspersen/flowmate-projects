<template>
  <div class="section-container py-8 md:py-16" :class="containerClasses" ref="sectionRef">
    <div class="default-grid gap-y-2 md:!gap-y-12">
      <HeadlineFields class="col-span-full" :data="data" :index="index" ref="headlineRef"></HeadlineFields>
      <div :class="getColSpan(index)" class="bg-orange-200 gallery-item" v-for="(image, index) in data.images" :ref="el => { if (el) galleryItemRefs.push(el) }">
        <cm-picture :image-object="image" classes="object-cover h-full w-full aspect-[3/2]"></cm-picture>
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
    default: function() {
      return []
    }
  },
  index: {
    type: Number,
    default: null
  }
});

// Animation refs
const sectionRef = ref(null);
const headlineRef = ref(null);
const galleryItemRefs = ref([]);

// Store ScrollTrigger instances for cleanup
const scrollTriggerInstances = ref([]);
// Store SplitText instances for cleanup
const splitTextInstances = ref([]);
// Store dynamically created style elements for cleanup
const styleElements = ref([]);

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

const getColSpan = (index) => {
  const spanClasses = ['col-span-7', 'col-span-5', 'col-span-5', 'col-span-7'];
  return spanClasses[index % spanClasses.length];
};

// Helper function to find heading elements inside a container
const findHeadingsInContainer = (container) => {
  if (!container) return { largeHeadings: [], smallHeadings: [] };
  
  const largeHeadings = Array.from(container.querySelectorAll('h1, h2'));
  const smallHeadings = Array.from(container.querySelectorAll('h3, h4, h5, h6'));
  
  return { largeHeadings, smallHeadings };
};

// Set up animations when the component is mounted
onMounted(() => {
  if (!sectionRef.value) return;
  
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
  
  // Create a timeline for animations
  const timeline = $gsap.timeline();
  
  // Animate headings if they exist
  if (headlineRef.value && headlineRef.value.$el) {
    const { largeHeadings, smallHeadings } = findHeadingsInContainer(headlineRef.value.$el);
    
    // Split and animate large headings character by character
    largeHeadings.forEach(heading => {
      const splitText = new $gsapSplitText(heading, { 
        type: "words,chars", 
        charsClass: "char-split",
        wordsClass: "word-split"
      });
      splitTextInstances.value.push(splitText);
      
      timeline.add(
        $gsap.fromTo(
          splitText.chars,
          { opacity: 0, y: 15, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)", stagger: 0.02 }
        ), 
        "-=0.3"
      );
    });
    
    // Split and animate small headings line by line
    smallHeadings.forEach(heading => {
      const splitText = new $gsapSplitText(heading, { type: "lines" });
      splitTextInstances.value.push(splitText);
      
      timeline.add(
        $gsap.fromTo(
          splitText.lines,
          { opacity: 0, y: 20, rotationX: -45 },
          { opacity: 1, y: 0, rotationX: 0, duration: 0.8, ease: "power3.out", stagger: 0.05 }
        ),
        "-=0.4"
      );
    });
  }
  
  // Stagger gallery images if any exist
  if (galleryItemRefs.value.length > 0) {
    timeline.fromTo(
      galleryItemRefs.value,
      { 
        opacity: 0, 
        scale: 0.9,
        y: 40,
      },
      { 
        opacity: 1, 
        scale: 1,
        y: 0,
        duration: 0.8, 
        ease: "power3.out", 
        stagger: 0.15
      },
      "-=0.2"
    );
  }
  
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
