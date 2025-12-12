<template>
  <div class="fixed w-screen h-screen inset-0 z-[22] overflow-hidden pointer-events-none opacity-0" 
       :class="coreStore.getShowMenu ? 'pointer-events-auto' : ''" 
       ref="menuContainer">
    <!-- Backdrop with fade transition -->
    <div class="absolute inset-0 backdrop-blur-md bg-dark-green/50"
         ref="backdrop">
    </div>
    
    <!-- Menu content with glass effect -->
    <div class="relative w-full h-full flex flex-col justify-center items-center"
         ref="menuContent">
      <nav v-if="mainMenu" class="max-w-4xl mx-auto px-6 w-full">
        <ul class="flex flex-col h-full gap-10 items-center justify-center">
          <li v-for="(link, index) in mainMenu" 
              :key="'burger-' + link.ID"
              class="menu-item overflow-hidden text-center"
              ref="menuItems">
            <nuxt-link class="text-4xl font-bold text-white hover:text-primary transition-colors block" 
                       :to="$getInternalPath(link)" 
                       v-if="$isInternalLink(link)">
              <span v-html="link.title"></span>
            </nuxt-link>
            <a class="text-4xl font-bold text-white hover:text-primary transition-colors block" 
               :href="link.url" 
               :target="link.target" 
               v-html="link.title" 
               v-else>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { useCoreStore } from '~/stores/core';
import { useGsapAnimations } from '~/composables/useGsapAnimations';
import { gsap } from 'gsap';

const coreStore = useCoreStore();
const { staggerAnimation } = useGsapAnimations();

const props = defineProps({
  mainMenu: {
    type: Array,
    default: () => [],
  }
});

const menuContainer = ref(null);
const backdrop = ref(null);
const menuContent = ref(null);
const menuItems = ref([]);

// GSAP timeline for menu animations
let menuTimeline = null;

// Initialize and create GSAP timeline
const initializeAnimations = () => {
  // Make sure GSAP is available
  if (!gsap) return;
  
  // Make sure container opacity is 1 when animations are initialized
  gsap.set(menuContainer.value, { visibility: 'visible', opacity: 1 });
  
  // Create a new timeline that's paused initially
  menuTimeline = gsap.timeline({ 
    paused: true,
    defaults: { ease: "power3.out" }
  });
  
  // Add animations to the timeline
  // 1. Backdrop fade in
  menuTimeline.to(backdrop.value, { 
    opacity: 1, 
    duration: 0.4,
    ease: "power2.out"
  }, 0);
  
  // 2. Menu content fade in
  menuTimeline.to(menuContent.value, { 
    opacity: 1, 
    duration: 0.4,
    ease: "power2.out"
  }, 0.1);
  
  // 3. Stagger the menu items with a sexy animation
  if (menuItems.value.length > 0) {
    menuTimeline.fromTo(
      menuItems.value,
      { 
        y: 50, 
        opacity: 0,
        rotationX: -15
      },
      { 
        y: 0, 
        opacity: 1,
        rotationX: 0,
        duration: 0.6,
        stagger: 0.08
      },
      0.2
    );
  }
  
  // If menu is already open (rare case on hot reload), play the timeline
  if (coreStore.getShowMenu) {
    menuTimeline.progress(1);
  }
};

// Play or reverse the timeline based on menu state
watch(() => coreStore.getShowMenu, (isOpen) => {
  if (!menuTimeline) return;
  
  if (isOpen) {
    // Ensure container is visible before playing the animation
    gsap.set(menuContainer.value, { visibility: 'visible', opacity: 1 });
    menuTimeline.play();
  } else {
    menuTimeline.reverse().eventCallback("onReverseComplete", () => {
      // After animation is fully reversed, hide container
      if (!coreStore.getShowMenu) {
        gsap.set(menuContainer.value, { visibility: 'hidden' });
      }
    });
  }
});

// Route change watcher
watch(() => coreStore.getRouteUpdate, (newVal) => {
  if(newVal && coreStore.getShowMenu) {
    coreStore.toggleShowMenu();
  }
});

// Initialize animations when component is mounted
onMounted(() => {
  // Set initial states - ensure menu is hidden on first load
  gsap.set(menuContainer.value, {
    visibility: coreStore.getShowMenu ? 'visible' : 'hidden',
    opacity: coreStore.getShowMenu ? 1 : 0
  });
  gsap.set(backdrop.value, { opacity: 0 });
  gsap.set(menuContent.value, { opacity: 0 });
  gsap.set(menuItems.value, { opacity: 0, y: 50 });
  
  // Initialize our animations
  nextTick(() => {
    initializeAnimations();
  });
});

// Clean up GSAP timelines when component is unmounted
onUnmounted(() => {
  if (menuTimeline) {
    menuTimeline.kill();
  }
});
</script>

<style scoped>
.menu-item {
  transform-style: preserve-3d;
  perspective: 1000px;
  width: 100%;
}
</style>
