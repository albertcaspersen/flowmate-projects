<template>
  <div class="section-container py-8 md:py-16" :class="containerClasses" ref="sectionRef">
    <div class="default-grid">
      <div class="col-span-full mb-6 md:mb-10" ref="headlineRef">
        <HeadlineFields :data="data" :index="index"></HeadlineFields>
      </div>
    </div>
    <div class="default-grid">
      <!-- Left side (Active demo card) - Main column (9/12) -->
      <div class="col-span-full md:col-span-8 lg:col-span-9 pr-0 md:pr-6">
        <div class="active-card-wrapper h-full relative group" style="min-height: 250px" ref="activeCardWrapper">
          <div 
            v-for="demoPage in demoPages" 
            :key="demoPage.id"
            class="active-card h-full rounded-lg overflow-hidden absolute inset-0 w-full transition-transform duration-500 ease-out"
            :class="{
              'translate-x-0 opacity-100 z-10': demoPage.id === activeCardId,
              'translate-x-[-120%] opacity-0 z-0 inactive-card': demoPage.id !== activeCardId
            }"
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
                  <h3 class="text-white text-xl md:text-2xl mb-2 group-hover:-translate-y-1 duration-300 transition">{{ demoPage.title.rendered }}</h3>
                  <div v-if="demoPage.excerpt && demoPage.excerpt.rendered" 
                       class="text-white/80 text-sm md:text-base line-clamp-2 mb-2"
                       v-html="demoPage.excerpt.rendered"></div>
                  <div class="inline-flex items-center text-white text-sm md:text-base">
                    <span>View case</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2 group-hover:translate-x-1 duration-300 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </nuxt-link>
          </div>
        </div>
      </div>
      
      <!-- Mobile slider for thumbnails (visible only on mobile) -->
      <div class="col-span-full mt-6 block md:hidden" ref="mobileSwiperContainer">
        <div class="mobile-slider-container overflow-visible">
          <CmSwiper 
            v-if="demoPages.length > 0" 
            :options="swiperOptions" 
            :block-index="index">
            <swiper-slide 
              v-for="demoPage in demoPages" 
              :key="demoPage.id" 
              class="mobile-slide"
              :class="{ 'active-slide': demoPage.id === activeCardId }"
              :data-demo-id="demoPage.id">
              <div 
                class="thumbnail-card rounded-lg overflow-hidden transition-all duration-300 cursor-pointer"
                :class="{ 'opacity-50 scale-95': demoPage.id === activeCardId }"
                @click="handleCardClick(demoPage)">
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
            </swiper-slide>
          </CmSwiper>
        </div>
      </div>
      
      <!-- Right side (Thumbnail column) - Smaller column (3/12) - Hidden on mobile -->
      <div class="col-span-full md:col-span-4 lg:col-span-3 mt-6 md:mt-0 hidden md:block" ref="thumbnailsContainer">
        <div class="thumbnails-wrapper">
          <div 
            v-for="demoPage in demoPages" 
            :key="demoPage.id"
            class="thumbnail-card mb-4 cursor-pointer rounded-lg overflow-hidden transition-all duration-300"
            :class="{ 'opacity-50 scale-95 active-thumbnail': demoPage.id === activeCardId }"
            :data-demo-id="demoPage.id"
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

// Demo pages data
const demoPages = ref([]);
const activeCardId = ref(null);
const isTransitioning = ref(false);

// Animation refs
const sectionRef = ref(null);
const headlineRef = ref(null);
const activeCardWrapper = ref(null);
const thumbnailsContainer = ref(null);
const mobileSwiperContainer = ref(null);

// Store animation instances for cleanup
const scrollTriggerInstances = ref([]);
const splitTextInstances = ref([]);
const styleElements = ref([]);

// Swiper configuration for mobile thumbnails
const swiperOptions = computed(() => {
  return {
    slidesPerView: 1.5,
    spaceBetween: 16,
    centeredSlides: false,
    breakpoints: {
      400: {
        slidesPerView: 2.2,
        spaceBetween: 16
      },
      520: {
        slidesPerView: 2.5,
        spaceBetween: 20
      }
    },
    on: {
      slideChange: (swiper) => {
        // Optional: sync active card ID with swiper navigation
        // Uncomment if you want slides to auto-activate when swiped to
        /*
        const activeSlide = swiper.slides[swiper.activeIndex];
        if (activeSlide) {
          const demoId = activeSlide.getAttribute('data-demo-id');
          if (demoId && demoId !== activeCardId.value) {
            handleSlideChange(demoId);
          }
        }
        */
      }
    }
  };
});

// Container classes computed property
const containerClasses = computed(() => {
  let classes = [];
  if (props.data.settings) {
    const { getContainerClasses } = useCheckmateFlexSettings(props.data.settings);
    classes = getContainerClasses('background', 'margin', 'padding', 'width', 'text');
  }
  return classes;
});

// Fetch demo pages - following the pattern from ArchiveBlock.vue
const fetchDemoPages = async () => {
  if (props.data.slider_content && props.data.slider_content.length > 0) {
    const { items } = await useFetchMate(props.data.slider_content);
    if (items.value && items.value.length > 0) {
      demoPages.value = items.value;
      
      // Set the first card as active initially
      activeCardId.value = demoPages.value[0].id;
    }
  }
};

// Watch for changes in demo pages data - This mirrors ShowcaseHero's approach
watch(demoPages, async (newVal) => {
  if (newVal.length > 0) {
    // Wait for DOM to update with new data before initializing animations
    await nextTick();
    // Initialize animations after data is loaded and DOM is updated
    initializeAnimations();
  }
}, { deep: true });

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

// Initialize animations when data is loaded
const initializeCardAnimations = () => {
  if (!thumbnailsContainer.value) return;
  
  const { $gsap, $gsapSplitText } = useNuxtApp();
  
  // Get all thumbnail cards
  const thumbnailCards = Array.from(thumbnailsContainer.value.querySelectorAll('.thumbnail-card'));
  
  thumbnailCards.forEach(card => {
    if (!card.classList.contains('active-thumbnail')) {
      // Get the title element
      const titleElement = card.querySelector('h5');
      
      if (titleElement) {
        // Use SplitText for more consistent animations, but only for entry animations
        try {
          const splitTitle = new $gsapSplitText(titleElement, { 
            type: "chars",
            charsClass: "char-split"
          });
          splitTextInstances.value.push(splitTitle);
          
          // Add hover event listeners using GSAP - without color change
          card.addEventListener('mouseenter', () => {
            if (!card.classList.contains('active-thumbnail')) {
              $gsap.to(card, { 
                scale: 1.02, 
                x: 5, 
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)", 
                duration: 0.3, 
                ease: "power2.out" 
              });
              
              // Subtle translation effect on the title instead of color change
              $gsap.to(titleElement, {
                x: 5,
                duration: 0.3,
                ease: "power2.out"
              });
            }
          });
          
          card.addEventListener('mouseleave', () => {
            if (!card.classList.contains('active-thumbnail')) {
              $gsap.to(card, { 
                scale: 1, 
                x: 0, 
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)", 
                duration: 0.3, 
                ease: "power2.out" 
              });
              
              // Reset title position
              $gsap.to(titleElement, {
                x: 0,
                duration: 0.3,
                ease: "power2.out"
              });
            }
          });
        } catch (error) {
          // Fallback to simpler animation if SplitText fails
          card.addEventListener('mouseenter', () => {
            if (!card.classList.contains('active-thumbnail')) {
              $gsap.to(card, { 
                scale: 1.02, 
                x: 5,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)", 
                duration: 0.3, 
                ease: "power2.out" 
              });
              
              $gsap.to(titleElement, { 
                x: 5, 
                duration: 0.3, 
                ease: "power2.out" 
              });
            }
          });
          
          card.addEventListener('mouseleave', () => {
            if (!card.classList.contains('active-thumbnail')) {
              $gsap.to(card, { 
                scale: 1, 
                x: 0, 
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)", 
                duration: 0.3, 
                ease: "power2.out" 
              });
              
              $gsap.to(titleElement, { 
                x: 0, 
                duration: 0.3, 
                ease: "power2.out" 
              });
            }
          });
        }
      }
    }
  });
};

// Initialize animations 
const initializeAnimations = () => {
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
    start: "top 80%",
    end: "bottom 20%",
    toggleActions: "play none none none",
  };
  
  // Create a timeline for initial animations
  const timeline = $gsap.timeline({
    onReverseComplete: () => {
      // Prevent reverse animation when scrolling back up
      timeline.progress(0).pause();
    }
  });
  
  // Animate headline elements
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
      
      timeline.add(
        $gsap.fromTo(
          splitText.chars,
          { opacity: 0, y: 15, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)", stagger: 0.02 }
        ),
        0
      );
    });
    
    // Line animation for small headings (h3-h6)
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
    
    // Find and animate paragraphs line by line
    const paragraphs = findParagraphsInContainer(headlineRef.value);
    if (paragraphs.length > 0) {
      paragraphs.forEach(paragraph => {
        const splitText = new $gsapSplitText(paragraph, { type: "lines" });
        splitTextInstances.value.push(splitText);
        
        timeline.add(
          $gsap.fromTo(
            splitText.lines,
            { opacity: 0, y: 20, rotationX: -45 },
            { opacity: 1, y: 0, rotationX: 0, duration: 0.8, ease: "power3.out", stagger: 0.05, delay: 0.1 }
          ),
          "-=0.6"
        );
      });
    }
  }
  
  // Animate the active card with a fade up
  if (activeCardWrapper.value) {
    // Set initial state first to make sure it starts invisible
    $gsap.set(activeCardWrapper.value, { opacity: 0, y: 30 });
    
    timeline.to(
      activeCardWrapper.value,
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
      0.5
    );
    
    // Also animate the card content with a staggered effect
    const cardTitle = activeCardWrapper.value.querySelector('.active-card h3');
    const cardDescription = activeCardWrapper.value.querySelector('.active-card .text-white\\/80');
    const cardCta = activeCardWrapper.value.querySelector('.active-card .inline-flex');
    
    if (cardTitle) {
      // Use SplitText for the card title to match other text animations
      const splitTitle = new $gsapSplitText(cardTitle, { 
        type: "words,chars", 
        charsClass: "char-split",
        wordsClass: "word-split"
      });
      splitTextInstances.value.push(splitTitle);
      
      timeline.add(
        $gsap.fromTo(
          splitTitle.chars,
          { opacity: 0, y: 15, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)", stagger: 0.02 }
        ),
        0.7
      );
    }
    
    if (cardDescription) {
      // Use SplitText for paragraph content
      const splitDesc = new $gsapSplitText(cardDescription, { type: "lines" });
      splitTextInstances.value.push(splitDesc);
      
      timeline.add(
        $gsap.fromTo(
          splitDesc.lines,
          { opacity: 0, y: 20, rotationX: -45 },
          { opacity: 1, y: 0, rotationX: 0, duration: 0.8, ease: "power3.out", stagger: 0.05 }
        ),
        0.8
      );
    }
    
    if (cardCta) {
      timeline.from(
        cardCta,
        { opacity: 0, y: 10, duration: 0.5, ease: "power2.out" },
        0.9
      );
    }
  }
  
  // Animate thumbnails with a staggered effect
  if (thumbnailsContainer.value) {
    // Get all thumbnail cards
    const thumbnailCards = Array.from(thumbnailsContainer.value.querySelectorAll('.thumbnail-card'));
    
    if (thumbnailCards.length > 0) {
      // Set initial state first
      $gsap.set(thumbnailCards, { opacity: 0, x: 30 });
      
      timeline.to(
        thumbnailCards,
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.5, 
          stagger: 0.1, 
          ease: "power2.out",
          onComplete: initializeCardAnimations
        },
        0.7
      );
    }
  }
  
  // Animate mobile swiper thumbnails if present
  if (mobileSwiperContainer.value) {
    const mobileSlides = Array.from(mobileSwiperContainer.value.querySelectorAll('.mobile-slide'));
    
    if (mobileSlides.length > 0) {
      // Set initial state first
      $gsap.set(mobileSlides, { opacity: 0, y: 20 });
      
      timeline.to(
        mobileSlides,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out"
        },
        0.7
      );
    }
  }
  
  // Apply scroll trigger to the timeline
  const trigger = scrollTriggerAnimation(sectionRef.value, timeline, scrollConfig);
  if (trigger) scrollTriggerInstances.value.push(trigger);
};

// Optional: function to handle slide change from swiper
const handleSlideChange = (demoId) => {
  if (isTransitioning.value || demoId === activeCardId.value) return;
  
  const demoPage = demoPages.value.find(page => page.id === demoId);
  if (demoPage) {
    handleCardClick(demoPage);
  }
};

// Handle card click to make it the active card
const handleCardClick = (demoPage) => {
  if (isTransitioning.value || demoPage.id === activeCardId.value) return;
  
  isTransitioning.value = true;
  
  // Update active card ID
  activeCardId.value = demoPage.id;
  
  // Reset transition state after animation completes
  setTimeout(() => {
    isTransitioning.value = false;
  }, 500); // Match duration in the transition class
};

// Watch for changes in active card to ensure cards are in view and update hover states
watch(activeCardId, (newVal, oldVal) => {
  if (newVal) {
    nextTick(() => {
      // Find the active thumbnail but don't scroll the page to it
      const activeThumbnail = document.querySelector(`.thumbnails-wrapper .thumbnail-card[data-demo-id="${newVal}"]`);
      
      // Remove hover animations from the active thumbnail and add them to the previously active one
      const { $gsap } = useNuxtApp();
      if (thumbnailsContainer.value) {
        // Get all thumbnail cards and apply appropriate states
        const thumbnailCards = Array.from(thumbnailsContainer.value.querySelectorAll('.thumbnail-card'));
        
        thumbnailCards.forEach(card => {
          const isActive = card.getAttribute('data-demo-id') === String(newVal);
          const wasActive = card.getAttribute('data-demo-id') === String(oldVal);
          
          // Make active card non-interactive
          if (isActive) {
            card.classList.add('active-thumbnail');
            // Reset any hover effects
            $gsap.to(card, { scale: 0.95, opacity: 0.5, x: 0, duration: 0.3 });
          } 
          // Restore hover capability to previously active card
          else if (wasActive) {
            card.classList.remove('active-thumbnail');
            // Reset to normal state
            $gsap.to(card, { scale: 1, opacity: 1, x: 0, duration: 0.3 });
          }
        });
      }
      
      // For mobile swiper, find the corresponding slide and scroll to it
      const swiperContainer = document.querySelector(`swiper-container#swiper-${props.index}`);
      if (swiperContainer && swiperContainer.swiper) {
        const swiper = swiperContainer.swiper;
        const slideIndex = demoPages.value.findIndex(page => page.id === newVal);
        if (slideIndex !== -1) {
          swiper.slideTo(slideIndex);
        }
      }
    });
  }
});

// Fetch data on component creation
fetchDemoPages();

// Check on mount if we should initialize animations
onMounted(() => {
  // Setup animations after component is mounted
  const setupAnimations = () => {
    if (demoPages.value.length > 0) {
      // If data is already loaded, initialize animations
      nextTick(() => {
        initializeAnimations();
      });
    } else {
      // Otherwise, make sure we fetch the data
      fetchDemoPages();
    }
  };
  
  // Run animation setup after DOM has updated
  nextTick(() => {
    setupAnimations();
  });
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
  
  // Remove any dynamically created style elements
  styleElements.value.forEach(style => {
    if (style && style.parentNode) {
      style.parentNode.removeChild(style);
    }
  });
});
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
  min-height: 225px; /* Minimum height for mobile */
}

@media (min-width: 640px) {
  .active-card-wrapper {
    min-height: 350px;
  }
}

@media (min-width: 768px) {
  .active-card-wrapper {
    height: 100%; /* Full height on desktop */
    min-height: auto;
  }
}

/* Inactive card styling - prevents interaction with offscreen cards */
.inactive-card {
  pointer-events: none !important;
}

/* Active thumbnail styling - prevents hover interaction */
.active-thumbnail {
  pointer-events: none !important;
  cursor: default !important;
}

/* Thumbnail card styling - removed CSS hover effects in favor of GSAP */
.thumbnail-card {
  will-change: transform, opacity;
  position: relative;
  overflow: hidden;
  transition: opacity 0.3s ease;
}

/* Mobile slider container styling */
.mobile-slider-container {
  margin: 0 -16px;
  padding: 0 16px;
}

/* Mobile slide styling */
.mobile-slide {
  transition: transform 0.3s ease-out;
}

.mobile-slide.active-slide {
  opacity: 0.7;
}

/* Swiper pagination customization */
:deep(.swiper-pagination-bullet) {
  background-color: currentColor;
  opacity: 0.5;
}

:deep(.swiper-pagination-bullet-active) {
  opacity: 1;
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
