<script setup>
import { ref, onMounted, computed } from 'vue';
import ImageViewer from './components/ImageViewer.vue';
import Navbar from './components/Navbar.vue';


import backgroundVideo from './pics/Skærmoptagelse 2025-11-19 kl. 16.27.52.mp4';
import mobileBackground from './pics/Skærmbillede 2025-11-21 kl. 10.24.52.png';

// Import spiralbilleder
import spiral1 from './spiralpics/Skærmbillede 2025-11-20 kl. 12.41.20.png';
import spiral2 from './spiralpics/Skærmbillede 2025-11-20 kl. 12.42.37.png';
import spiral3 from './spiralpics/Skærmbillede 2025-11-20 kl. 12.43.49.png';
import spiral4 from './spiralpics/Skærmbillede 2025-11-20 kl. 12.44.50.png';
import spiral5 from './spiralpics/Skærmbillede 2025-11-20 kl. 12.46.03.png';
import spiral6 from './spiralpics/Skærmbillede 2025-11-20 kl. 12.47.18.png';
import spiral7 from './spiralpics/Skærmbillede 2025-11-20 kl. 12.47.46.png';
import spiral8 from './spiralpics/Skærmbillede 2025-11-20 kl. 12.48.55.png';
import spiral9 from './spiralpics/Skærmbillede 2025-11-20 kl. 12.51.29.png';

const startIndex = ref(0);
const heroOpacity = ref(1);
const heroBlur = ref(0);
const viewerBlur = ref(0);
const viewerBrightness = ref(1);

// Mobil detection - kun til optimering
const isMobile = ref(false);

// Funktion til at opdatere mobil status
const updateMobileStatus = () => {
  isMobile.value = window.innerWidth <= 768;
};

// Sæt initial værdi
updateMobileStatus();

// Lyt på resize events
window.addEventListener('resize', updateMobileStatus);

// Scroll til toppen når komponenten mountes
onMounted(() => {
  // Scroll til toppen med instant behavior
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'instant'
  });
  
  // Sikr også at scroll position er 0 ved page load
  if (window.scrollY > 0) {
    window.scrollTo(0, 0);
  }

  // Tilføj scroll event listener for fade-out og blur effekt
  // Med throttling på mobil for bedre performance
  let scrollTimeout = null;
  const handleScroll = () => {
    // Throttle scroll events på mobil for bedre performance
    if (isMobile.value && scrollTimeout) return;
    
    const executeScroll = () => {
      const scrollPosition = window.scrollY;
      
      // Hero blur og fade-out
      const fadeStart = 0;
      const fadeEnd = 600;
      const maxBlur = 10;
      
      if (scrollPosition <= fadeStart) {
        heroOpacity.value = 1;
        heroBlur.value = 0;
      } else if (scrollPosition >= fadeEnd) {
        heroOpacity.value = 0;
        heroBlur.value = maxBlur;
      } else {
        const progress = (scrollPosition - fadeStart) / (fadeEnd - fadeStart);
        heroOpacity.value = 1 - progress;
        heroBlur.value = progress * maxBlur;
      }

      // Viewer (video) blur og darkening effekt når vi scroller forbi viewer-wrapper
      const viewerWrapper = document.querySelector('.viewer-wrapper');
      if (viewerWrapper) {
        const viewerRect = viewerWrapper.getBoundingClientRect();
        const viewerBottom = viewerRect.bottom;
        const windowHeight = window.innerHeight;
        
        // Start blur når vi er 70% nede i viewer-wrapper
        const blurStartOffset = windowHeight * 0.7;
        const blurEndOffset = windowHeight * 0.3;
        
        if (viewerBottom > blurStartOffset) {
          // Ingen blur eller darkening endnu
          viewerBlur.value = 0;
          viewerBrightness.value = 1;
        } else if (viewerBottom < blurEndOffset) {
          // Maksimal blur og darkening
          viewerBlur.value = 8;
          viewerBrightness.value = 0.5; // 50% brightness = mørk
        } else {
          // Gradvis blur og darkening
          const blurProgress = 1 - (viewerBottom - blurEndOffset) / (blurStartOffset - blurEndOffset);
          viewerBlur.value = blurProgress * 8;
          viewerBrightness.value = 1 - (blurProgress * 0.5); // Fra 1 til 0.5
        }
      }
      
      if (isMobile.value) {
        scrollTimeout = null;
      }
    };
    
    if (isMobile.value) {
      scrollTimeout = setTimeout(executeScroll, 50);
    } else {
      executeScroll();
    }
  };

  window.addEventListener('scroll', handleScroll);
  
  // Cleanup event listener når komponenten unmountes
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
});

// Scroll til toppen når siden refresher eller loader
if (typeof window !== 'undefined') {
  // Forhindre scroll restoration i browsere
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  
  // Scroll til toppen ved page load
  window.addEventListener('load', () => {
    window.scrollTo(0, 0);
  });
  
  // Scroll til toppen når DOM er klar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.scrollTo(0, 0);
    });
  } else {
    window.scrollTo(0, 0);
  }
}

// Lokale spiralbilleder - alle billeder til desktop
const allImages = [
  { id: 1, src: spiral1, alt: 'Spiral billede 1' },
  { id: 2, src: spiral2, alt: 'Spiral billede 2' },
  { id: 3, src: spiral3, alt: 'Spiral billede 3' },
  { id: 4, src: spiral4, alt: 'Spiral billede 4' },
  { id: 5, src: spiral5, alt: 'Spiral billede 5' },
  { id: 6, src: spiral6, alt: 'Spiral billede 6' },
  { id: 7, src: spiral7, alt: 'Spiral billede 7' },
  { id: 8, src: spiral8, alt: 'Spiral billede 8' },
  { id: 9, src: spiral9, alt: 'Spiral billede 9' }
];

// Reducer antallet af billeder på mobil for bedre performance
// Desktop: alle 9 billeder | Mobil: kun 5 billeder
const imageList = computed(() => {
  return isMobile.value ? allImages.slice(0, 5) : allImages;
});
</script>

<template>
  <div id="app">
    <!-- Video baggrund på desktop, statisk billede på mobil for performance -->
    <video 
      v-if="!isMobile"
      class="background-video" 
      :src="backgroundVideo" 
      autoplay 
      loop 
      muted 
      playsinline
    ></video>
    <div 
      v-else
      class="background-image"
      :style="{ backgroundImage: `url(${mobileBackground})` }"
    ></div>
    
    <!-- Navbar -->
    <Navbar />
    
    <!-- Header med billede -->
    <header class="header-section">
      <div class="grid-container">
        <div class="hero-content">
          <p class="text-xs sm:text-sm font-medium tracking-wider uppercase text-white/70 mb-6" :style="{ opacity: heroOpacity, filter: `blur(${heroBlur}px)` }">FLOWMATE REALTIME EDITOR</p>
          <h1 class="text-[2.25rem] sm:text-[3rem] md:text-[4rem] xl:text-[6rem] font-bold leading-[1.1] mb-6 text-white tracking-[-0.02em]" :style="{ opacity: heroOpacity, filter: `blur(${heroBlur}px)` }">Flowmate er din nye bedste ven.</h1>
          <p class="text-[0.95rem] sm:text-base lg:text-lg xl:text-xl leading-relaxed text-white/90 font-normal" :style="{ opacity: heroOpacity, filter: `blur(${heroBlur}px)` }">Nåh ja, og realtime frontend editor til headless websites.</p>
        </div>
      </div>
    </header>
    
    <!-- Scroll indicator - fixed i bunden -->
    <div 
      class="scroll-indicator fixed bottom-6 sm:bottom-8 md:bottom-10 lg:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[1000] group"
      :style="{ opacity: heroOpacity }"
    >
      <p class="text-xs sm:text-sm font-medium tracking-wider uppercase text-white/70 m-0 group-hover:text-white transition-colors">Scroll Videre</p>
      <div class="flex flex-col gap-1 items-center">
        <span class="scroll-line w-8 h-[0.1rem] bg-white/70 rounded-sm group-hover:bg-white transition-colors" style="animation-delay: 0s"></span>
        <span class="scroll-line w-8 h-[0.1rem] bg-white/70 rounded-sm group-hover:bg-white transition-colors" style="animation-delay: 0.15s"></span>
        <span class="scroll-line w-8 h-[0.1rem] bg-white/70 rounded-sm group-hover:bg-white transition-colors" style="animation-delay: 0.3s"></span>
      </div>
    </div>

    <!-- Vagt-element der markerer toppen/starten af scroll-zonen -->
    <div id="viewer-top-sentinel" style="height: 1px;"></div>

    <!-- Wrapper for sticky scroll effekt -->
    <div 
      class="viewer-wrapper"
      :style="{ minHeight: `calc(${(imageList.length + 1) * 77.5}px + 120vh)` }"
    >
      <ImageViewer 
        :key="`viewer-${isMobile}`"
        :images="imageList" 
        :start-index="startIndex" 
        :visible="true"
        :video-src="isMobile ? null : 'https://flowmate.dk/wp-content/uploads/2025/05/flowmate-video-editor.mp4'"
        :blur-amount="viewerBlur"
        :brightness="viewerBrightness"
        :is-mobile="isMobile"
      />
    </div>

    <!-- Vagt-element der markerer bunden/slutningen af scroll-zonen -->
    <div id="viewer-bottom-sentinel" style="height: 1px;"></div>

    <!-- Content Management sektion -->
    <section class="content-management-section">
      <div class="grid-container">
        <div class="content-management-wrapper">
          <div class="content-left">
            <h2 class="content-title">
              Flowmate forenkler websites og content management – nemt, hurtigt og problemfrit.
            </h2>
            <p class="content-description">
              Lad Flowmate håndtere alt – design, udvikling, hosting, compliance og sikkerhed. Det skal være sjovt og nemt at skabe smukke, velfungerende websites uden hovedpiner.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

@keyframes wave {
  0%, 100% {
    transform: scaleX(1);
  }
  50% {
    transform: scaleX(1.5);
    opacity: 1;
  }
}

.scroll-line {
  animation: wave 1.5s ease-in-out infinite;
}

html {
  scroll-behavior: auto;
  scroll-padding-top: 0;
}

html, body {
  width: 100%;
  overflow-x: hidden;
  scroll-behavior: auto;
}

#app {
  width: 100%;
  min-height: 100vh;
  position: relative;
}

/* 12-kolonne grid system */
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  width: calc(100% - 10rem); /* 5rem på hver side */
  margin: 0 5rem; /* 5rem margin til venstre og højre */
}

@media (max-width: 1024px) {
  .grid-container {
    width: calc(100% - 8rem); /* 4rem på hver side */
    margin: 0 4rem;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .grid-container {
    width: calc(100% - 5rem); /* 2.5rem på hver side */
    margin: 0 2.5rem;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .grid-container {
    width: calc(100% - 3rem); /* 1.5rem på hver side */
    margin: 0 1.5rem;
    gap: 12px;
  }
}

.background-video {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
  pointer-events: none;
}

.background-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -1;
  pointer-events: none;
}

.header-section {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  top: 38rem;
  justify-content: flex-start;
}


.hero-content {
  grid-column: 1 / 9; /* Spænder over de første 8 kolonner */
  color: #fff;
}







/* Responsive design for hero */
@media (max-width: 1024px) {
  .hero-content {
    grid-column: 1 / 10; /* Spænder over 9 kolonner på mellemstore skærme */
  }
  
}

@media (max-width: 768px) {
  .hero-content {
    grid-column: 1 / 13; /* Spænder over alle 12 kolonner på små skærme */
  }
  
}

@media (max-width: 480px) {
}

.header-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.viewer-wrapper {
  position: relative;
}

/* Content Management Section */
.content-management-section {
  width: 100%;
  min-height: 100vh;
  position: relative;
  background-color: transparent;
  padding: 120px 0 0;
}

.content-management-wrapper {
  display: contents; /* Gør at children bruger parent grid */
}

.content-left {
  display: contents; /* Gør at children (title, description, video) bruger grid */
}

.content-title {
  font-size: 4.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 2rem;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  
  grid-column: 1 / 9; /* Spænder over 10 kolonner */
}

.content-description {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-weight: 400;
  grid-column: 1 / 5; /* Spænder over 6 kolonner */
}

/* Responsive design for content management section */
@media (max-width: 1024px) {
  .content-management-section {
    padding: 80px 0 0;
  }
  
  .content-title {
    font-size: 3rem;
    grid-column: 1 / 12; /* Spænder over 11 kolonner */
  }
  
  .content-description {
    font-size: 1rem;
    grid-column: 1 / 8; /* Spænder over 7 kolonner */
  }
}

@media (max-width: 768px) {
  .content-management-section {
    padding: 60px 0 0;
  }
  
  .content-title {
    font-size: 2.5rem;
    grid-column: 1 / 13; /* Spænder over alle kolonner */
  }
  
  .content-description {
    grid-column: 1 / 13; /* Spænder over alle kolonner */
  }
}

@media (max-width: 480px) {
  .content-management-section {
    padding: 40px 0 0;
  }
  
  .content-title {
    font-size: 2rem;
  }
  
  .content-description {
    font-size: 0.95rem;
  }
}
</style>