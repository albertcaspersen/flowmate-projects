<template>
  <div class="w-full relative overflow-hidden flex items-end" :id="'hero-' + index" :class="[containerClasses, props.data.settings.hero_size === 'half_screen' && props.index !== 0 ? '!items-center' : '']" ref="heroRef">
    <div class="inset-0 absolute bg-black z-[1]" :class="'opacity-' + data.settings.overlay_opacity"></div>

    <cm-picture v-if="heroType === 'image' && data.background_image" :image-object="data.background_image" :crops="['default:hero_vertical', 'md:hero_medium', 'lg:hero']" :classes="'absolute inset-0 flex items-center z-0 w-full h-full object-cover absolute inset-0'" :lazy="false"></cm-picture>
    <hero-cm-video v-if="heroType === 'video' && data.background_video" :index="index" :src="data.background_video.url" classes="w-full h-full absolute inset-0 z-0 h-full w-full object-cover"></hero-cm-video>

    <div class="w-full px-4 pb-8 sm:px-15 sm:pb-15 relative z-10" :class="props.data.settings.hero_size === 'half_screen' && props.index !== 0 ? 'pt-8 sm:pt-15' : 'pt-32'" ref="contentRef">
      <div class="flex flex-col justify-end md:flex-row md:justify-between md:items-end text-white">
        <div class="max-w-[800px] md:w-[60%]" ref="headlineRef">
          <HeadlineFields :always-big="true" :data="data" :index="index"></HeadlineFields>
          <div v-if="data.text" :class="data.eyebrow || data.header || data.subheader ? 'mt-4' : ''" v-html="data.text" ref="textRef"></div>
        </div>
        <Buttons :data="data" ref="buttonsRef"></Buttons>
      </div>
    </div>
  </div>
</template>
<script setup>
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
const heroRef = ref(null);
const contentRef = ref(null);
const headlineRef = ref(null);
const textRef = ref(null);
const buttonsRef = ref(null);

// Store ScrollTrigger instances for cleanup
const scrollTriggerInstances = ref([]);
// Store SplitText instances for cleanup
const splitTextInstances = ref([]);
// Store dynamically created style elements for cleanup
const styleElements = ref([]);

const heroType = computed(() => {
  return props.data.hasOwnProperty('settings') && props.data.settings.hasOwnProperty('hero_type') ? props.data.settings.hero_type : 'image';
});

const containerClasses = computed(() => {
  return props.data.hasOwnProperty('settings') && props.data.settings.hasOwnProperty('hero_size') && props.data.settings.hero_size === 'half_screen' ?  'min-h-[50svh]' : 'min-h-svh';
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
  if (!heroRef.value) return;
  
  const { $gsap, $gsapSplitText } = useNuxtApp();
  const { fadeUp } = useGsapAnimations();
  
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
  
  // Create a timeline for animations
  const timeline = $gsap.timeline({ delay: 0.5 }); // Delay to allow page load
  
  // Animate hero content
  timeline.fromTo(
    contentRef.value,
    { opacity: 0 },
    { opacity: 1, duration: 0.8 }
  );
  
  // Animate headings if they exist
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
      
      timeline.fromTo(
        splitText.chars,
        { opacity: 0, y: 15, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)", stagger: 0.02 },
        "-=0.6"
      );
    });
    
    // Split and animate small headings line by line
    smallHeadings.forEach(heading => {
      const splitText = new $gsapSplitText(heading, { type: "lines" });
      splitTextInstances.value.push(splitText);
      
      timeline.fromTo(
        splitText.lines,
        { opacity: 0, y: 20, rotationX: -45 },
        { opacity: 1, y: 0, rotationX: 0, duration: 0.8, ease: "power3.out", stagger: 0.05 },
        "-=0.4"
      );
    });
  }
  
  // Animate text paragraphs if they exist
  if (textRef.value) {
    const paragraphs = findParagraphsInContainer(textRef.value);
    
    if (paragraphs.length > 0) {
      paragraphs.forEach(paragraph => {
        const splitText = new $gsapSplitText(paragraph, { type: "lines" });
        splitTextInstances.value.push(splitText);
        
        timeline.fromTo(
          splitText.lines,
          { opacity: 0, y: 20, rotationX: -45 },
          { opacity: 1, y: 0, rotationX: 0, duration: 0.8, ease: "power3.out", stagger: 0.05 },
          "-=0.6"
        );
      });
    } else {
      // Fallback if no paragraphs found
      timeline.add(fadeUp(textRef.value, { delay: 0.1 }), "-=0.4");
    }
  }
  
  // Animate buttons
  if (buttonsRef.value) {
    timeline.add(fadeUp(buttonsRef.value, { delay: 0.1 }), "-=0.4");
  }
});

// Clean up instances when the component is unmounted
onBeforeUnmount(() => {
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
