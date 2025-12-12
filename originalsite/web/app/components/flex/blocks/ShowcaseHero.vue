<template>
  <div class="w-full relative overflow-hidden flex items-start justify-center min-h-[125vh]" 
       :id="'showcase-hero-' + index"
       ref="heroSection">
    <!-- Background Media -->
    <cm-picture v-if="heroType === 'image' && data.background_image" 
                :image-object="data.background_image" 
                :crops="['default:hero_vertical', 'md:hero_medium', 'lg:hero']" 
                classes="absolute inset-0 flex items-center z-0 w-full h-full object-cover" 
                :lazy="false">
    </cm-picture>
    
    <hero-cm-video v-if="heroType === 'video' && data.background_video" 
                  :index="index" 
                  :src="data.background_video.url" 
                  classes="w-full h-full absolute inset-0 z-0 h-full w-full object-cover">
    </hero-cm-video>

    <!-- Custom gradient overlay for blending - now between background and content -->
    <div class="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-transparent via-transparent to-dark-green/90 opacity-85"></div>
    
    <!-- Black overlay - also between background and content -->
    <div v-if="data.settings && data.settings.overlay_opacity" 
         class="inset-0 absolute bg-black z-[1]" 
         :class="'opacity-' + data.settings.overlay_opacity">
    </div>

    <!-- Content Section - Top Positioned -->
    <div class="w-full px-4 relative z-10 pt-[10vh] md:pt-[15vh] xl:pt-[25vh]" ref="heroContent">
      <div class="max-w-[800px] mx-auto text-white flex flex-col items-center">
        <!-- HeadlineFields wrapper for animation targeting -->
        <div ref="headlinesWrapper">
          <HeadlineFields class="text-center" :data="data" :index="index" ref="headlines"></HeadlineFields>
        </div>
        <div v-if="data.text" 
             :class="data.eyebrow || data.header || data.subheader ? 'mt-4 text-center' : 'text-center'" 
             v-html="data.text"
             ref="heroText">
        </div>
        <div class="" ref="buttonWrapper">
          <Buttons :data="data"></Buttons>
        </div>
        
        <!-- Mobile Only - Swiper for Demo Items -->
        <div v-if="demoPages.length > 0 && isMobile" class="w-full mt-12 md:hidden" ref="mobileSwiper">
          <cm-swiper :block-index="index" :options="mobileSliderOptions">
            <swiper-slide v-for="(demoPage, idx) in demoPages" :key="'mobile-slide-' + demoPage.id">
              <div class="showcase-item-mobile px-3 group hover:scale-[101%] duration-300 transition">
                <nuxt-link :to="demoPage.post_path">
                  <div class="aspect-square rounded-xl overflow-hidden shadow-lg">
                    <cm-video v-if="demoPage.acf && demoPage.acf.featured_video" 
                              :src="demoPage.acf.featured_video.url"
                              classes="w-full h-full object-cover">
                    </cm-video>
                    <cm-picture v-else-if="demoPage.featured_image_object" 
                                :image-object="demoPage.featured_image_object" 
                                classes="w-full h-full object-cover">
                    </cm-picture>
                  </div>
                  <div class="mt-4 text-white text-center">
                    <h6 class="text-xl group-hover:-translate-y-1 duration-300 group-hover:text-primary transition">{{ demoPage.title.rendered }}</h6>
                  </div>
                </nuxt-link>
              </div>
            </swiper-slide>
            
            <!-- Custom swiper pagination -->
            <div class="swiper-pagination mt-4"></div>
          </cm-swiper>
          
          <!-- Visual hint text for horizontal scrolling -->
          <div class="text-center text-white/50 text-sm mt-2">
            <span>Swipe or use mousewheel to explore</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Demo Pages Section with Parallax Effect - Desktop/Tablet Only -->
    <div  v-if="demoPages.length > 0 && !isMobile" 
         class="w-full absolute bottom-[-18vh] lg:bottom-[-14vh] xl:bottom-[10vh] 2xl:bottom-[25vh] left-0 z-10 pb-16 px-4 md:px-10 showcase-container"
         ref="showcaseContainer">
      <div class="max-w-[1400px] mx-auto">
        <div class="grid grid-cols-12 gap-4 md:gap-6">
          <div class="col-span-12 sm:col-span-6 md:col-span-4 group showcase-item" 
               v-for="(demoPage, idx) in demoPages" 
               :key="demoPage.id"
               :ref="el => { if (el) showcaseItems[idx] = el }"
               :data-speed="getParallaxSpeed(idx)">
            <nuxt-link :to="demoPage.post_path">
              <div class="aspect-[8/5] rounded-lg overflow-hidden">
                <cm-video v-if="demoPage.acf && demoPage.acf.featured_video" 
                          :src="demoPage.acf.featured_video.url">
                </cm-video>
                <cm-picture v-else-if="demoPage.featured_image_object" 
                            :image-object="demoPage.featured_image_object" 
                            classes="w-full h-full object-cover">
                </cm-picture>
              </div>
              <div class="mt-3 group-hover:translate-x-2 duration-300 transition text-white">
                <h6>{{ demoPage.title.rendered }}</h6>
              </div>
            </nuxt-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCheckmateFlexSettings } from "~/composables/checkmateFlexSettings";
import { useFetchMate } from "~/composables/fetchMate";
import { useGsapAnimations } from "~/composables/useGsapAnimations";
import { onMounted, ref, onUnmounted, onBeforeUnmount, computed, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import ShowcaseHero from './ShowcaseHero.vue'
import CmSwiper from '~/components/partials/CmSwiper.vue';

const route = useRoute();
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

// Get hero type from settings
const heroType = computed(() => {
  return props.data.hasOwnProperty('settings') && props.data.settings.hasOwnProperty('hero_type') 
    ? props.data.settings.hero_type 
    : 'image';
});

// Demo pages data
const demoPages = ref([]);
const demoPagesLoaded = ref(false);

// Swiper configuration for mobile
const mobileSliderOptions = {
  slidesPerView: 1.1,
  spaceBetween: 16,
  centeredSlides: false,
  mousewheel: {
    forceToAxis: true,
    invert: false,
    thresholdDelta: 50
  },
  breakpoints: {
    480: {
      slidesPerView: 1.1,
    }
  }
};

// References for DOM elements
const heroSection = ref(null);
const heroContent = ref(null);
const headlines = ref(null);
const headlinesWrapper = ref(null);
const heroText = ref(null);
const buttonWrapper = ref(null);
const showcaseContainer = ref(null);
const showcaseItems = ref([]);
const mobileSwiper = ref(null);

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

// Window dimensions for responsive adjustments
const windowWidth = ref(0);
const windowHeight = ref(0);

// Mobile detection
const isMobile = computed(() => {
  return windowWidth.value < 768; // Standard breakpoint for mobile
});

// Function to determine item-specific parallax speed
const getParallaxSpeed = (index) => {
  const column = index % 3;
  const speeds = [0.7, 0.5, 0.9]; // Different speeds for each column
  return speeds[column];
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

// Update window dimensions
const updateWindowDimensions = () => {
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;
};

// Fetch demo pages
const fetchDemoPages = async () => {
  if (props.data.demo_pages && props.data.demo_pages.length > 0) {
    const { items } = await useFetchMate(props.data.demo_pages);
    if (items.value) {
      demoPages.value = items.value;
      demoPagesLoaded.value = true;
    }
  }
};

// Watch for changes in demo pages data
watch(demoPages, async (newVal) => {
  if (newVal.length > 0) {
    // Wait for DOM to update with new data
    await nextTick();
  }
}, { deep: true });

onMounted(() => {
  // Initialize window dimensions
  updateWindowDimensions();
  
  // Add resize listener with debounce
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateWindowDimensions, 250);
  });
  
  // Fetch demo pages
  fetchDemoPages();
  
  // Setup animations
  const setupAnimations = () => {
    if (!heroSection.value) return;
    
    const { $gsap, $gsapScrollTrigger, $gsapSplitText } = useNuxtApp();
    const animations = useGsapAnimations();
    const { fadeUp, scrollTriggerAnimation, staggerAnimation } = animations;
    
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
      trigger: heroSection.value,
      start: "top 80%", // Start animation when the top of the element reaches 80% from the top of the viewport
      end: "bottom 20%",
      toggleActions: "play none none none", // Play on enter, don't do anything on leave
      preventOverlaps: true, // Prevent conflicts with other ScrollTriggers
      fastScrollEnd: true, // Better performance
    };
    
    // Create a timeline for hero content animation
    const heroTimeline = $gsap.timeline({
      onReverseComplete: () => {
        // Prevent reverse animation when scrolling back up
        heroTimeline.progress(0).pause();
      }
    });
    
    // Find headings in the headlines wrapper
    if (headlinesWrapper.value) {
      const { largeHeadings, smallHeadings } = findHeadingsInContainer(headlinesWrapper.value);
      
      // Split and animate large headings character by character
      largeHeadings.forEach(heading => {
        const splitText = new $gsapSplitText(heading, { 
          type: "words,chars", 
          charsClass: "char-split",
          wordsClass: "word-split"
        });
        splitTextInstances.value.push(splitText);
        
        heroTimeline.add(
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
        
        heroTimeline.add(
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
    if (heroText.value) {
      const paragraphs = findParagraphsInContainer(heroText.value);
      
      if (paragraphs.length > 0) {
        paragraphs.forEach(paragraph => {
          const splitText = new $gsapSplitText(paragraph, { type: "lines" });
          splitTextInstances.value.push(splitText);
          
          heroTimeline.add(
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
        heroTimeline.add(fadeUp(heroText.value, { delay: 0.2 }), "-=0.4");
      }
    }
    
    // Animate buttons with fadeUp
    if (buttonWrapper.value) {
      heroTimeline.add(fadeUp(buttonWrapper.value, { delay: 0.2 }), "-=0.4");
    }
    
    // Apply scroll trigger to the timeline
    const trigger = scrollTriggerAnimation(heroSection.value, heroTimeline, scrollConfig);
    if (trigger) scrollTriggerInstances.value.push(trigger);
    
    // Handle demo pages animations
    const setupDemoPagesAnimations = () => {
      if (demoPagesLoaded.value && !isMobile.value && showcaseItems.value.length > 0) {
        // Create staggered animation for demo pages appearing
        const demoItemsTimeline = $gsap.timeline({
          delay: 0.5, // Start after main content animation
          onReverseComplete: () => {
            // Prevent reverse animation when scrolling back up
            demoItemsTimeline.progress(0).pause();
          }
        });
        
        // Initial state - all items hidden
        $gsap.set(showcaseItems.value, { 
          opacity: 0, 
          y: 80,
          scale: 0.95
        });
        
        // Staggered reveal animation
        demoItemsTimeline.to(showcaseItems.value, {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.15, // Time between each item's animation
          duration: 0.8,
          ease: "power3.out"
        });
        
        // Apply scroll trigger to the demo items timeline
        const demoPagesAnimTrigger = scrollTriggerAnimation(showcaseContainer.value, demoItemsTimeline, {
          trigger: showcaseContainer.value,
          start: "top 100%",
          end: "bottom 70%",
          toggleActions: "play none none none"
        });
        if (demoPagesAnimTrigger) scrollTriggerInstances.value.push(demoPagesAnimTrigger);
        
        // Set up parallax scrolling for the showcase items
        showcaseItems.value.forEach((item, idx) => {
          const speed = getParallaxSpeed(idx);
          const parallaxTrigger = $gsapScrollTrigger.create({
            trigger: heroSection.value,
            start: "top top",
            end: "bottom top",
            scrub: true, // Smooth scrubbing effect that ties animation progress to scrollbar
            preventOverlaps: true, // Prevent conflicts with other ScrollTriggers
            fastScrollEnd: true, // Better performance
            onUpdate: (self) => {
              // Apply parallax effect - transform value increases as you scroll
              const yOffset = self.progress * 700 * speed;
              $gsap.set(item, { 
                y: -yOffset, // Negative value makes items move up as you scroll down
                ease: "none" // Linear movement tied directly to scroll
              });
            }
          });
          if (parallaxTrigger) scrollTriggerInstances.value.push(parallaxTrigger);
        });
      }
      
      // Handle mobile swiper animation
      if (demoPagesLoaded.value && isMobile.value && demoPages.value.length > 0 && mobileSwiper.value) {
        // Get swiper slides
        const slides = mobileSwiper.value.querySelectorAll('swiper-slide');
        const hintText = mobileSwiper.value.querySelector('.text-white\\/50');
        
        if (slides.length > 0) {
          // Set initial state
          $gsap.set(slides, { 
            opacity: 0, 
            y: 40,
            scale: 0.92,
            rotationX: -10
          });
          
          if (hintText) {
            $gsap.set(hintText, {
              opacity: 0,
              y: 10
            });
          }
          
          // Create animation timeline
          const mobileSwiperTimeline = $gsap.timeline({
            delay: 0.7, // Start after main content animation
            onReverseComplete: () => {
              // Prevent reverse animation when scrolling back up
              mobileSwiperTimeline.progress(0).pause();
            }
          });
          
          // Staggered reveal animation for slides
          mobileSwiperTimeline.to(slides, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationX: 0,
            stagger: 0.15,
            duration: 0.8,
            ease: "back.out(1.4)"
          });
          
          // Animate hint text
          if (hintText) {
            mobileSwiperTimeline.to(hintText, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out"
            }, "-=0.3");
          }
          
          // Add a subtle attention animation to the first slide after initial load
          mobileSwiperTimeline.to(slides[0].querySelector('.showcase-item-mobile'), {
            x: 5,
            duration: 0.3,
            ease: "power1.inOut",
            repeat: 1,
            yoyo: true,
            delay: 1
          });
        }
      }
    };
    
    // Initialize demo page animations
    setupDemoPagesAnimations();
    
    // Also watch for demo pages loading in case they load after initial setup
    watch(demoPagesLoaded, async (isLoaded) => {
      if (isLoaded) {
        await nextTick();
        setupDemoPagesAnimations();
      }
    }, { immediate: false });
  };
  
  // Run animation setup after DOM has updated
  nextTick(() => {
    setupAnimations();
  });
});

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

onUnmounted(() => {
  // Remove event listeners
  window.removeEventListener('resize', updateWindowDimensions);
});

// Call fetch on component setup
fetchDemoPages();
</script>

<style scoped>
.showcase-container {
  /* Base positioning */
  transform: translateY(0);
}

.showcase-item-mobile {
  /* Square aspect ratio container */
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

/* Make sure gradient covers the entire hero section */
.bg-gradient-to-b {
  height: 100%;
  width: 100%;
  /* To ensure it blends properly on all backgrounds */
  mix-blend-mode: multiply;
}

/* Min height adjustments for mobile */
@media (max-width: 767px) {
  .min-h-\[125vh\] {
    min-height: 110vh; /* Increased min-height to accommodate swiper */
    padding-bottom: 50px;
  }
  
  /* Adjust the gradient for mobile view to be more visible */
  .bg-gradient-to-b {
    opacity: 1;
  }
  
  /* Mobile swiper styling */
  swiper-container {
    padding-bottom: 2.5rem;
    margin: 0 -4px; /* Reduced side margin for better visibility of main slide */
    overflow: visible;
  }
  
  swiper-slide {
    height: auto; /* Allow natural height */
    opacity: 1;
    transition: opacity 0.3s ease;
  }
  
  /* Visual indicator for swipe-ability */
  swiper-container::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 50px;
    height: 100%;
    background: linear-gradient(to right, rgba(5, 15, 0, 0), rgba(5, 15, 0, 0.3));
    z-index: 2;
    pointer-events: none;
  }
}

/* Responsive adjustments for tablet and desktop */
@media (min-width: 768px) {
  .showcase-item {
    transform: translateY(120px);
  }
  
  /* Ensure overlay covers full height on larger screens */
  .bg-gradient-to-b, 
  .bg-black {
    height: 125vh; /* Match the min-height of the container */
  }
}

@media (min-width: 1024px) {
  .showcase-item {
    transform: translateY(150px);
  }
}
</style>