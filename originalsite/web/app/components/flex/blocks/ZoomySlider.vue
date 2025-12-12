<template>
  <div class="zoomy-slider section-container py-8 md:py-16" :class="containerClasses" ref="sliderSection">
    <!-- Slider Section -->
    <div class="zoomy-slider-container">
      <CmSwiper v-if="mediaItems.length > 0" 
                :options="swiperOptions" 
                :block-index="index"
                ref="sliderRef">
        <swiper-slide v-for="(item, itemIndex) in mediaItems" 
                     :key="itemIndex"
                     class="zoomy-slide"
                     :class="[slideSize, slideClasses]">
          <!-- Video Content -->
          <div v-if="item.video" class="aspect-[14/10] w-full h-full relative overflow-hidden rounded-lg">
            <cm-video :src="item.video.url"
                      class="h-full w-full object-cover" 
                      classes="h-full w-full object-cover">
            </cm-video>
          </div>
          
          <!-- Image Content -->
          <div v-else-if="item.image" class="aspect-[14/10] w-full h-full relative overflow-hidden rounded-lg">
            <cm-picture :image-object="item.image" 
                        :add-curtain="data.settings && data.settings.add_image_curtain" 
                        :delay="itemIndex * 0.1" 
                        :crops="imageCropSizes" 
                        classes="w-full h-full object-cover"
                        class="w-full h-full object-cover">
            </cm-picture>
            
            <!-- Optional Overlay -->
            <div v-if="item.overlay_text" class="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/70 to-transparent">
              <h4 class="text-white">{{ item.overlay_text }}</h4>
            </div>
          </div>
        </swiper-slide>
      </CmSwiper>
    </div>
  </div>
</template>

<script setup>
import { useCheckmateFlexSettings } from "~/composables/checkmateFlexSettings";
import { useGsapAnimations } from "~/composables/useGsapAnimations";
import { ref, computed, onMounted, onBeforeUnmount, nextTick, reactive } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/pagination';

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

// Store window dimensions for responsive behavior
const windowSize = reactive({
  width: typeof window !== 'undefined' ? window.innerWidth : 0,
  height: typeof window !== 'undefined' ? window.innerHeight : 0
});

// Update window size on resize
const updateWindowSize = () => {
  windowSize.width = window.innerWidth;
  windowSize.height = window.innerHeight;
};

// Computed property to determine if we should apply scaling
const shouldApplyScaling = computed(() => {
  // Don't apply scaling on mobile devices (under 768px width)
  return windowSize.width >= 768;
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

// Media items from data source (slider_cards or media_items)
const mediaItems = computed(() => {
  if (props.data.media_items && props.data.media_items.length > 0) {
    return props.data.media_items;
  }
  if (props.data.slider_cards && props.data.slider_cards.length > 0) {
    return props.data.slider_cards;
  }
  return [];
});

// Slide size classes
const slideSize = computed(() => {
  const size = props.data.settings?.slide_size || 'normal';
  switch (size) {
    case 'small':
      return 'zoomy-slide-small';
    case 'large':
      return 'zoomy-slide-large';
    default:
      return 'zoomy-slide-normal';
  }
});

// Additional slide classes
const slideClasses = computed(() => {
  return props.data.settings?.slide_classes || '';
});

// Image crop sizes
const imageCropSizes = computed(() => {
  if (props.data.settings?.image_crops) {
    return props.data.settings.image_crops;
  }
  return ['default:10_14', 'xl:10_14_large'];
});

// Active slide scale factor - can be configured via settings
const activeSlideScale = computed(() => {
  return props.data.settings?.active_slide_scale || 1.6;
});

// Swiper configuration with defaults that can be overridden via props
const swiperOptions = computed(() => {
  // Base options that apply to all screen sizes
  const defaultOptions = {
    slidesPerView: 1.2,
    speed: 500,
    spaceBetween: 16,
    centeredSlides: false,
    // Enable freeMode on mobile for smoother scrolling without snapping
    freeMode: windowSize.width < 768,
    freeModeSticky: false,
    freeModeMinimumVelocity: 0.1, // Lower value makes it stop faster after swipe
    freeModeBoolean: true, // Makes it truly free without momentum bounce effect
    // Enable looping on mobile
    loop: windowSize.width < 768,
    loopAdditionalSlides: 2,
    mousewheel: {
      forceToAxis: true,
    },
    on: {
      slideChange: (swiper) => {
        handleSlideChange(swiper);
      },
      init: (swiper) => {
        // Initialize the active slide state
        nextTick(() => {
          setupActiveSlide(swiper);
        });
      },
      resize: () => {
        // Update Swiper configuration when screen size changes
        if (swiperInstance.value) {
          // Update freeMode and loop settings based on screen width
          const isMobile = windowSize.width < 768;
          swiperInstance.value.params.freeMode = isMobile;
          
          // Update loop mode - requires swiper rebuild to take effect
          const wasLoopEnabled = swiperInstance.value.params.loop;
          swiperInstance.value.params.loop = isMobile;
          
          // If loop mode changed, we need to tell swiper to update properly
          if (wasLoopEnabled !== isMobile) {
            // Allow time for the DOM to update
            setTimeout(() => {
              swiperInstance.value.loopDestroy();
              swiperInstance.value.loopCreate();
              swiperInstance.value.update();
            }, 50);
          } else {
            swiperInstance.value.update();
          }
        }
      }
    },
    breakpoints: {
      640: {
        slidesPerView: 2,
        spaceBetween: 24,
        // Maintain freeMode and loop for small tablets
        freeMode: windowSize.width < 768,
        loop: windowSize.width < 768,
      },
      768: {
        slidesPerView: 2.5,
        spaceBetween: 32,
        // Disable freeMode and loop on desktop
        freeMode: false,
        loop: false,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 32,
        freeMode: false,
        loop: false,
      },
      1280: {
        slidesPerView: 4,
        spaceBetween: 48,
        freeMode: false,
        loop: false,
      },
    }
  };

  // Override with custom settings if provided
  if (props.data.settings?.swiper_options) {
    return { ...defaultOptions, ...props.data.settings.swiper_options };
  }

  return defaultOptions;
});

// Animation references
const sliderSection = ref(null);
const sliderRef = ref(null);
const swiperInstance = ref(null);

// Store animation instances for cleanup
const scrollTriggerInstances = ref([]);
const styleElements = ref([]);

// Animation configurations
const animationConfigs = {
  slideAnimation: {
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }
  }
};

// Handle slide change event
const handleSlideChange = (swiper) => {
  if (!swiper) return;
  
  // In freeMode on mobile, we may not want to highlight a specific "active" slide
  // since the slider can stop between slide positions
  if (windowSize.width < 768 && swiper.params.freeMode) {
    // For mobile in freeMode, just ensure no slide has scaling applied
    const slides = swiper.slides;
    if (slides && slides.length > 0) {
      const { $gsap } = useNuxtApp();
      $gsap.set(slides, {
        scale: 1,
        x: 0,
        zIndex: 'auto'
      });
      
      slides.forEach(slide => slide.classList.remove('zoomy-slide-active'));
    }
    return;
  }
  
  // Normal active slide setup for desktop
  setupActiveSlide(swiper);
};

// Set up active slide with enhanced styling
const setupActiveSlide = (swiper) => {
  if (!swiper) return;
  swiperInstance.value = swiper;

  const { $gsap } = useNuxtApp();
  
  // Get all slides
  const slides = swiper.slides;
  if (!slides || slides.length === 0) return;
  
  // If we shouldn't apply scaling (on mobile), reset all slides and return
  if (!shouldApplyScaling.value) {
    // Reset all slides to default state without any scaling or offsets
    $gsap.set(slides, {
      scale: 1,
      x: 0,
      zIndex: 'auto'
    });
    
    // Remove active class from all slides
    slides.forEach((slide) => {
      slide.classList.remove('zoomy-slide-active');
    });
    
    return;
  }
  
  // Desktop scaling behavior below
  
  // Get current spacing between slides (from swiper instance)
  const spaceBetween = swiper.params.spaceBetween;
  
  // IMPORTANT: First reset ALL slides to their original position and scale
  // This prevents the cumulative effect when changing slides multiple times
  $gsap.set(slides, {
    scale: 1,
    x: 0,
    clearProps: "z-index"
  });
  
  // Get currently active slide and enhance it
  const activeIndex = swiper.activeIndex;
  const activeSlide = slides[activeIndex];
  
  if (activeSlide) {
    // Bring active slide to front and scale it up
    $gsap.to(activeSlide, {
      scale: activeSlideScale.value,
      duration: 0.5,
      ease: "back.out(1.7)",
      zIndex: 10
    });
    
    // Calculate how much space the active slide will expand by
    const expandAmount = (activeSlideScale.value - 1) * activeSlide.offsetWidth / 2;
    
    // Add extra spacing proportional to the scale increase
    const spacingMultiplier = 1.2;
    const adjustedExpandAmount = expandAmount * spacingMultiplier;
    
    // Adjust all slides to maintain consistent spacing
    slides.forEach((slide, idx) => {
      // Add/remove class for additional styling
      if (idx === activeIndex) {
        slide.classList.add('zoomy-slide-active');
      } else {
        slide.classList.remove('zoomy-slide-active');
        
        // Calculate position based on distance from active slide
        if (idx < activeIndex) {
          // Slides to the left of active slide
          const distanceFromActive = activeIndex - idx;
          // Move proportionally based on distance from active slide
          $gsap.to(slide, {
            x: -adjustedExpandAmount,
            duration: 0.4,
            ease: "back.out(1.1)"
          });
        } else if (idx > activeIndex) {
          // Slides to the right of active slide
          const distanceFromActive = idx - activeIndex;
          // Move proportionally based on distance from active slide
          $gsap.to(slide, {
            x: adjustedExpandAmount,
            duration: 0.4,
            ease: "back.out(1.1)"
          });
        }
      }
    });
  }
};

onMounted(() => {
  if (!sliderSection.value) return;
  
  // Setup window resize listener for responsive behavior
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateWindowSize);
    // Initial call to set the value
    updateWindowSize();
  }
  
  const { $gsap, $gsapScrollTrigger } = useNuxtApp();
  const { scrollTriggerAnimation } = useGsapAnimations();
  
  // Define scroll trigger configuration
  const scrollConfig = {
    trigger: sliderSection.value,
    start: "top 80%", // Start animation when the top of the element reaches 80% from the top of the viewport
    end: "bottom 20%",
    toggleActions: "play none none none", // Play on enter, don't do anything on leave
    preventOverlaps: true, // Prevent conflicts with other ScrollTriggers
    fastScrollEnd: true, // Better performance
  };
  
  // Create a timeline for animations
  const timeline = $gsap.timeline({ 
    paused: true,
    onReverseComplete: () => {
      // Prevent reverse animation when scrolling back up
      timeline.progress(0).pause();
    }
  });
  
  // Slides animation
  if (sliderRef.value) {
    // Get all slides after they're mounted
    setTimeout(() => {
      const slides = document.querySelectorAll('.zoomy-slide');
      if (slides.length > 0) {
        // Set initial state - hide but maintain scaled state
        $gsap.set(slides, animationConfigs.slideAnimation.from);
        
        // Pre-setup active slide to prevent layout shift during reveal
        if (swiperInstance.value && shouldApplyScaling.value) {
          const swiper = swiperInstance.value;
          const activeIndex = swiper.activeIndex;
          const activeSlide = swiper.slides[activeIndex];
          
          if (activeSlide) {
            // Pre-calculate spacing needed based on the active slide scale
            const expandAmount = (activeSlideScale.value - 1) * activeSlide.offsetWidth / 2;
            const spacingMultiplier = 1.2;
            const adjustedExpandAmount = expandAmount * spacingMultiplier;
            
            // Apply scaled size to active slide immediately (before animation)
            $gsap.set(activeSlide, {
              scale: activeSlideScale.value,
              zIndex: 10
            });
            
            // Pre-position other slides correctly (before animation)
            swiper.slides.forEach((slide, idx) => {
              if (idx === activeIndex) {
                slide.classList.add('zoomy-slide-active');
              } else {
                slide.classList.remove('zoomy-slide-active');
                
                // Position non-active slides correctly from the start
                if (idx < activeIndex) {
                  $gsap.set(slide, { x: -adjustedExpandAmount });
                } else if (idx > activeIndex) {
                  $gsap.set(slide, { x: adjustedExpandAmount });
                }
              }
            });
          }
        }
        
        // Animate all slides fading in together - positions already set
        timeline.add(
          $gsap.to(slides, {
            ...animationConfigs.slideAnimation.to,
            stagger: 0.1,
            clearProps: "opacity" // Only clear opacity, keep transforms
          }),
          0
        );
      }
    }, 100); // Small delay to ensure slides are in DOM
  }
  
  // Apply scroll trigger to the timeline
  const trigger = scrollTriggerAnimation(sliderSection.value, timeline, scrollConfig);
  if (trigger) scrollTriggerInstances.value.push(trigger);
});

onBeforeUnmount(() => {
  // Remove window resize listener
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateWindowSize);
  }

  // Kill all ScrollTrigger instances
  scrollTriggerInstances.value.forEach(trigger => {
    if (trigger && trigger.kill) {
      trigger.kill();
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
.zoomy-slider {
  padding-top: 4rem;
  padding-bottom: 4rem;
  position: relative;
}

.zoomy-slider-container {
  margin: 0 -16px;
  padding: 0 16px;
  /* Make space for overflow slides to be visible */
  overflow: visible;
  /* Add extra top/bottom padding to accommodate for scaled active slide */
  padding-top: 2rem;
  padding-bottom: 2rem;
}

@media (min-width: 768px) {
  .zoomy-slider-container {
    margin: 0 -32px;
    padding: 0 32px;
    padding-top: 3.5rem;
    padding-bottom: 3.5rem;
  }
}

/* Target the shadow DOM of swiper-container element */
:deep(swiper-container)::part(container) {
  overflow: visible;
}

/* Make sure swiper wrapper is also visible */
:deep(.swiper-wrapper) {
  overflow: visible;
  align-items: center;
}

/* Mobile-specific styles for freeMode */
@media (max-width: 767px) {
  /* Improve touch feel in freeMode */
  :deep(.swiper-wrapper) {
    touch-action: pan-y;
    -webkit-overflow-scrolling: touch;
    /* Add more horizontal space for free scrolling */
    padding-right: 16px;
  }
  
  /* Add subtle indication that content is scrollable */
  .zoomy-slider-container:after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 32px;
    background: linear-gradient(to right, transparent, rgba(0,0,0,0.03));
    pointer-events: none;
  }
  
  /* Slightly reduce the slide shadow on mobile */
  .zoomy-slide {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
}

.zoomy-slide {
  transition: transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
  border-radius: 8px;
  will-change: transform;
  transform-origin: center center;
  transform-style: preserve-3d;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Enhanced active slide effect - only on desktop */
@media (min-width: 768px) {
  :deep(.swiper-slide-active) {
    z-index: 10;
  }

  :deep(.zoomy-slide-active) {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
}

/* Slide sizes */
.zoomy-slide-small {
  max-width: 280px;
}

.zoomy-slide-normal {
  max-width: 350px;
}

.zoomy-slide-large {
  max-width: 450px;
}

/* Pagination customization */
:deep(.swiper-pagination-bullet) {
  background-color: currentColor;
  opacity: 0.5;
}

:deep(.swiper-pagination-bullet-active) {
  opacity: 1;
}
</style>
