<template>
  <div class="section-container py-8 md:py-16" :class="containerClasses" ref="sectionRef">
    <div class="default-grid" :class="isInSbs ? 'half-grid' : ''">
      <div class="col-span-full md:col-span-6 flex flex-col items-center text-center gap-y-5" :class="isInSbs ? '' : 'md:col-start-4'" ref="quoteContainer">
        <h2 class="!mb-0" v-if="data.hasOwnProperty('quote_text') && data.quote_text" ref="quoteRef">
          <span v-if="data.quote_text" v-html="'&quot;' + data.quote_text + '&quot;'"></span>
        </h2>
        <h6 class="!mb-0" v-if="data.hasOwnProperty('quotee') && data.quotee" ref="quoteeRef">
          <span v-if="data.quotee" v-html="data.quotee"></span>
        </h6>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCheckmateFlexSettings } from "~/composables/checkmateFlexSettings";
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
const quoteContainer = ref(null);
const quoteRef = ref(null);
const quoteeRef = ref(null);

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

// Set up animations when the component is mounted
onMounted(() => {
  if (!sectionRef.value || !quoteContainer.value) return;
  
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
  
  // Animate quote text with character splitting
  if (quoteRef.value) {
    const splitText = new $gsapSplitText(quoteRef.value, { 
      type: "words,chars", 
      charsClass: "char-split",
      wordsClass: "word-split"
    });
    splitTextInstances.value.push(splitText);
    
    timeline.fromTo(
      splitText.chars,
      { 
        opacity: 0, 
        y: 15, 
        scale: 0.9,
        rotationY: 45
      },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        rotationY: 0,
        duration: 0.7, 
        ease: "back.out(1.7)", 
        stagger: 0.01 
      }
    );
  }
  
  // Animate quotee with line splitting
  if (quoteeRef.value) {
    // Simple fade up for the quotee (author)
    timeline.fromTo(
      quoteeRef.value,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      "-=0.3"
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
