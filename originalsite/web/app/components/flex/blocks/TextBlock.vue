<template>
  <div 
    class="section-container py-8 md:py-16" 
    :class="containerClasses"
    ref="sectionRef"
  >
    <div class="default-grid" v-if="data.settings.columns === 'one-col'" :class="isInSbs ? 'half-grid' : ''">
      <div 
        class="col-span-full" 
        ref="contentRef"
        :class="[isInSbs ? '' : 'md:col-span-8 md:col-start-3 lg:col-start-4 lg:col-span-6', data.settings.content_span && data.settings.content_span === 'wide' ? 'lg:!col-span-8 lg:!col-start-3' : '', data.settings.button_alignment && data.settings.button_alignment === 'center' ? 'flex flex-col items-center' : '']"
      >
        <div ref="headlineRef">
          <HeadlineFields :data="data" :index="index"></HeadlineFields>
        </div>
        <div 
          v-if="data.text_col_one" 
          ref="textRef"
          :class="data.eyebrow || data.header || data.subheader ? 'mt-4' : ''" 
          v-html="data.text_col_one"
        ></div>
        <div ref="buttonsRef">
          <Buttons :data="data"></Buttons>
        </div>
      </div>
    </div>
    <div class="default-grid" v-if="data.settings.columns === 'two-col'" :class="isInSbs ? 'half-grid' : ''">
      <div 
        class="col-span-full" 
        ref="headlineTwoColRef"
        :class="[isInSbs ? '' : 'md:col-span-8 md:col-start-3 lg:col-start-4 lg:col-span-6', data.settings.content_span && data.settings.content_span === 'wide' ? 'lg:!col-span-8 lg:!col-start-3' : '']"
      >
        <HeadlineFields :data="data" :index="index"></HeadlineFields>
      </div>

      <div 
        class="col-span-full lg:col-span-3" 
        ref="col1Ref"
        :class="isInSbs ? '' : 'md:col-span-8 md:col-start-3 lg:col-start-4'"
      >
        <div :class="data.eyebrow || data.header || data.subheader ? 'mt-4' : ''" v-if="data.text_col_one" v-html="data.text_col_one"></div>
        <Buttons :data="data"></Buttons>
      </div>

      <div 
        class="col-span-full lg:col-span-3" 
        ref="col2Ref"
        :class="isInSbs ? '' : 'md:col-span-8 md:col-start-3'"
      >
        <div :class="data.eyebrow || data.header || data.subheader ? 'mt-4' : ''" v-if="data.text_col_two" v-html="data.text_col_two"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {useCheckmateFlexSettings} from "~/composables/checkmateFlexSettings";
import { useGsapAnimations } from "~/composables/useGsapAnimations";
import { onMounted, onBeforeUnmount, ref, watch } from "vue";

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

// Create refs for the elements we want to animate
const sectionRef = ref(null);
const contentRef = ref(null);
const headlineRef = ref(null);
const textRef = ref(null);
const buttonsRef = ref(null);
const headlineTwoColRef = ref(null);
const col1Ref = ref(null);
const col2Ref = ref(null);

// Store ScrollTrigger instances for cleanup
const scrollTriggerInstances = ref([]);
// Store SplitText instances for cleanup
const splitTextInstances = ref([]);
// Store dynamically created style elements for cleanup
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
  }
};

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

// Set up animations when the component is mounted
onMounted(() => {
  if (!sectionRef.value) return;
  
  const { $gsap, $gsapScrollTrigger, $gsapSplitText } = useNuxtApp();
  const { fadeUp, scrollTriggerAnimation } = useGsapAnimations();
  
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
  
  // Create animations based on which layout is active
  if (props.data.settings.columns === 'one-col') {
    // Create a timeline for one column layout
    const oneColTimeline = $gsap.timeline();
    
    // Find headings and paragraphs in the headlineRef
    if (headlineRef.value) {
      const { largeHeadings, smallHeadings } = findHeadingsInContainer(headlineRef.value);
      
      // Split and animate large headings character by character
      largeHeadings.forEach(heading => {
        const splitText = new $gsapSplitText(heading, { 
          type: "words,chars", 
          charsClass: "char-split",
          wordsClass: "word-split"
        });
        splitTextInstances.value.push(splitText);
        
        oneColTimeline.add(
          $gsap.fromTo(
            splitText.chars,
            animationConfigs.splitChars.from,
            animationConfigs.splitChars.to
          ), 
          "-=0.3"
        );
      });
      
      // Split and animate small headings line by line
      smallHeadings.forEach(heading => {
        const splitText = new $gsapSplitText(heading, { type: "lines" });
        splitTextInstances.value.push(splitText);
        
        oneColTimeline.add(
          $gsap.fromTo(
            splitText.lines,
            animationConfigs.splitLines.from,
            animationConfigs.splitLines.to
          ),
          "-=0.4"
        );
      });
    }
    
    // Animate text content with line splitting
    if (textRef.value) {
      const paragraphs = findParagraphsInContainer(textRef.value);
      
      if (paragraphs.length > 0) {
        paragraphs.forEach(paragraph => {
          const splitText = new $gsapSplitText(paragraph, { type: "lines" });
          splitTextInstances.value.push(splitText);
          
          oneColTimeline.add(
            $gsap.fromTo(
              splitText.lines,
              animationConfigs.splitLines.from,
              { ...animationConfigs.splitLines.to, delay: 0.1 }
            ),
            "-=0.6"
          );
        });
      } else {
        // Fallback if no paragraphs found
        oneColTimeline.add(fadeUp(textRef.value, { delay: 0.2 }), "-=0.4");
      }
    }
    
    // Animate buttons with fadeUp
    if (buttonsRef.value) {
      oneColTimeline.add(fadeUp(buttonsRef.value, { delay: 0.2 }), "-=0.4");
    }
    
    // Apply scroll trigger to the timeline
    const trigger = scrollTriggerAnimation(sectionRef.value, oneColTimeline, scrollConfig);
    if (trigger) scrollTriggerInstances.value.push(trigger);
  } else {
    // Create a timeline for two column layout
    const twoColTimeline = $gsap.timeline();
    
    // Handle headline for two-column layout
    if (headlineTwoColRef.value) {
      const { largeHeadings, smallHeadings } = findHeadingsInContainer(headlineTwoColRef.value);
      
      // Character animation for large headings
      largeHeadings.forEach(heading => {
        const splitText = new $gsapSplitText(heading, { 
          type: "words,chars", 
          charsClass: "char-split",
          wordsClass: "word-split"
        });
        splitTextInstances.value.push(splitText);
        
        twoColTimeline.add(
          $gsap.fromTo(
            splitText.chars,
            animationConfigs.splitChars.from,
            animationConfigs.splitChars.to
          ),
          "-=0.3"
        );
      });
      
      // Line animation for small headings
      smallHeadings.forEach(heading => {
        const splitText = new $gsapSplitText(heading, { type: "lines" });
        splitTextInstances.value.push(splitText);
        
        twoColTimeline.add(
          $gsap.fromTo(
            splitText.lines,
            animationConfigs.splitLines.from,
            animationConfigs.splitLines.to
          ),
          "-=0.4"
        );
      });
    }
    
    // Animate first column
    if (col1Ref.value) {
      const paragraphs = findParagraphsInContainer(col1Ref.value);
      
      if (paragraphs.length > 0) {
        paragraphs.forEach(paragraph => {
          const splitText = new $gsapSplitText(paragraph, { type: "lines" });
          splitTextInstances.value.push(splitText);
          
          twoColTimeline.add(
            $gsap.fromTo(
              splitText.lines,
              animationConfigs.splitLines.from,
              { ...animationConfigs.splitLines.to, delay: 0.1 }
            ),
            "-=0.5"
          );
        });
      } else {
        // Fallback to standard animation
        twoColTimeline.add(fadeUp(col1Ref.value, { delay: 0.2 }), "-=0.4");
      }
    }
    
    // Animate second column
    if (col2Ref.value) {
      const paragraphs = findParagraphsInContainer(col2Ref.value);
      
      if (paragraphs.length > 0) {
        paragraphs.forEach(paragraph => {
          const splitText = new $gsapSplitText(paragraph, { type: "lines" });
          splitTextInstances.value.push(splitText);
          
          twoColTimeline.add(
            $gsap.fromTo(
              splitText.lines,
              animationConfigs.splitLines.from,
              { ...animationConfigs.splitLines.to, delay: 0.2 }
            ),
            "-=0.4"
          );
        });
      } else {
        // Fallback to standard animation
        twoColTimeline.add(fadeUp(col2Ref.value, { delay: 0.3 }), "-=0.3");
      }
    }
    
    // Apply scroll trigger to the timeline
    const trigger = scrollTriggerAnimation(sectionRef.value, twoColTimeline, scrollConfig);
    if (trigger) scrollTriggerInstances.value.push(trigger);
  }
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
