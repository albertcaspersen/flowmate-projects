<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import ImageViewer from './components/ImageViewer.vue';
import Navbar from './components/Navbar.vue';
import Preloader from './components/Preloader.vue';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);


// Mediefiler fra public mappen
// const backgroundVideo = '/pics/Skærmoptagelse 2025-11-19 kl. 16.27.52.mp4'; // ERSTATTET MED SHADER
const mobileBackground = '/pics/Skærmbillede 2025-11-21 kl. 10.24.52.png'; // Bruges nu som tekstur i shaderen

// Spiralbilleder fra public mappen
const spiral1 = '/spiralpics/Skærmbillede 2025-11-20 kl. 12.41.20.png';
const spiral2 = '/spiralpics/Skærmbillede 2025-11-20 kl. 12.42.37.png';
const spiral3 = '/spiralpics/Skærmbillede 2025-11-20 kl. 12.43.49.png';
const spiral4 = '/spiralpics/Skærmbillede 2025-11-20 kl. 12.44.50.png';
const spiral5 = '/spiralpics/Skærmbillede 2025-11-20 kl. 12.46.03.png';
const spiral6 = '/spiralpics/Skærmbillede 2025-11-20 kl. 12.47.18.png';
const spiral7 = '/spiralpics/Skærmbillede 2025-11-20 kl. 12.47.46.png';
const spiral8 = '/spiralpics/Skærmbillede 2025-11-20 kl. 12.48.55.png';
const spiral9 = '/spiralpics/Skærmbillede 2025-11-20 kl. 12.51.29.png';

const startIndex = ref(0);
const heroOpacity = ref(1);
const heroBlur = ref(0);
const viewerBlur = ref(0);
const viewerBrightness = ref(1);

const isMobile = ref(false);

// Loading state
const isLoading = ref(true);
const showPreloader = ref(true);
const webglTextureLoaded = ref(false);
const spiralImagesLoaded = ref(false);
const preloaderRef = ref(null);

const updateMobileStatus = () => {
  isMobile.value = window.innerWidth <= 768;
};

// Handle når spiral billeder er loadet
const handleSpiralImagesLoaded = () => {
  spiralImagesLoaded.value = true;
  checkIfAllLoaded();
};

// Warm-up scroll funktion til at "prime" GPU'en
const warmUpScroll = () => {
  // Temporarily enable scrolling for warm-up
  document.body.style.overflowY = 'auto';
  document.documentElement.style.overflowY = 'auto';
  
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  
  // Use GSAP to smoothly scroll through the page
  const tl = gsap.timeline({
    onComplete: () => {
      // Disable scrolling again until preloader completes
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
  });
  
  // Smooth scroll down and back up
  tl.to(window, {
    scrollTo: maxScroll * 0.5,
    duration: 0.4,
    ease: 'none'
  })
  .to(window, {
    scrollTo: maxScroll,
    duration: 0.4,
    ease: 'none'
  })
  .to(window, {
    scrollTo: 0,
    duration: 0.5,
    ease: 'none'
  });
};

// Tjek om alt er loadet
const checkIfAllLoaded = () => {
  if (webglTextureLoaded.value && spiralImagesLoaded.value) {
    // Kør warm-up scroll først
    warmUpScroll();
    
    // Vent på at progress bar når 100% (3s) + lidt ekstra tid
    setTimeout(() => {
      isLoading.value = false;
    }, 3300);
  }
};

// Watch for when loading completes
watch(isLoading, (newVal) => {
  if (!newVal && preloaderRef.value) {
    preloaderRef.value.animateOut();
  }
});

// Handle preloader complete
const handlePreloaderComplete = () => {
  showPreloader.value = false;
  
  // Re-enable scrolling - use overflow-x hidden, overflow-y auto
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  document.body.style.overflowX = 'hidden';
  document.body.style.overflowY = 'auto';
  document.documentElement.style.overflowX = 'hidden';
  document.documentElement.style.overflowY = 'auto';
  
  console.log('Scrolling enabled');
};

// --------------- START: WebGL Gradient Shader Integration ---------------

const webglCanvas = ref(null); // Ref til vores canvas element
let animationFrameId = null; // Til at stoppe animationen ved oprydning
const cleanupFunctions = []; // Samler alle event listeners for nem oprydning

// Vertex Shader (uændret)
const VS = `#version 100
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Fragment Shader (uændret)
const FS = `#version 100
precision mediump float;
varying vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform sampler2D u_tex;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 x) {
  vec2 i = floor(x);
  vec2 f = fract(x);
  float a = hash(i + vec2(0.0,0.0));
  float b = hash(i + vec2(1.0,0.0));
  float c = hash(i + vec2(0.0,1.0));
  float d = hash(i + vec2(1.0,1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  v += a * noise(p); p *= 2.0; a *= 0.5;
  v += a * noise(p); p *= 2.0; a *= 0.5;
  v += a * noise(p);
  return v;
}

vec3 palette(float t) {
  vec3 a = vec3(0.0, 0.05, 0.08);      // Mørk blå/grøn
  vec3 b = vec3(0.0, 0.3, 0.25);       // Medium cyan/grøn
  vec3 c = vec3(0.1, 0.6, 0.4);        // Turkis
  vec3 d = vec3(0.6, 0.95, 0.3);       // Lys lime/grøn
  
  float t1 = smoothstep(0.0, 0.33, t);
  float t2 = smoothstep(0.33, 0.66, t);
  float t3 = smoothstep(0.66, 1.0, t);
  
  vec3 col = mix(a, b, t1);
  col = mix(col, c, t2);
  col = mix(col, d, t3);
  
  return col;
}

void main() {
  vec2 uv = (v_uv * 2.0 - 1.0);
  uv.x *= u_resolution.x / u_resolution.y;
  float t = u_time * 0.15;
  vec2 m = (u_mouse.xy / u_resolution) * 2.0 - 1.0;
  m.x *= u_resolution.x / u_resolution.y;
  vec2 p = uv * 0.8;
  p += vec2(t * 0.15, t * 0.08);
  
  // Flere lag af noise for dybde
  float n = fbm(p + m * 0.3 + t * 0.1);
  float n2 = fbm(p * 0.7 - vec2(0.0, t*0.12));
  float n3 = fbm(p * 1.2 + vec2(t*0.08, -t*0.05));
  
  // Kombiner noise med mere kontrast
  float mixv = n * 0.5 + n2 * 0.3 + n3 * 0.2;
  mixv = smoothstep(0.05, 0.95, mixv);
  
  vec3 col = palette(mixv);
  
  vec2 texUV = v_uv;
  vec4 sample = texture2D(u_tex, texUV);
  float lum = dot(sample.rgb, vec3(0.299,0.587,0.114));
  col += (lum - 0.5) * 0.06;
  
  // Mere kontrast via power
  col = pow(col, vec3(0.85));
  
  gl_FragColor = vec4(col, 1.0);
}`;


// Funktioner til at kompilere shader og linke program
function createShader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function createProgram(gl, vsSrc, fsSrc) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  const p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(p));
    return null;
  }
  return p;
}

// --------------- SLUT: WebGL Gradient Shader Integration ---------------


onMounted(() => {
  // Disable scrolling mens preloader viser
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  // Sæt mobil status ved start
  updateMobileStatus();
  window.addEventListener('resize', updateMobileStatus);

  // Scroll til toppen med instant behavior
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  
  // Sikr også at scroll position er 0 ved page load
  if (window.scrollY > 0) window.scrollTo(0, 0);

  // --------------- START: WebGL Initialisering ---------------

  const canvas = webglCanvas.value;
  if (!canvas) return;

  const gl = canvas.getContext('webgl', { antialias: false, preserveDrawingBuffer: false });
  if (!gl) { alert('WebGL er ikke tilgængelig'); return; }

  const program = createProgram(gl, VS, FS);
  gl.useProgram(program);

  const posLoc = gl.getAttribLocation(program, 'a_pos');
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(program, 'u_resolution');
  const uTime = gl.getUniformLocation(program, 'u_time');
  const uMouse = gl.getUniformLocation(program, 'u_mouse');
  const uTex = gl.getUniformLocation(program, 'u_tex');

  const img = new Image();
  img.src = mobileBackground; // Bruger din billedsti her
  img.crossOrigin = "anonymous";
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([128, 128, 128, 255]));
  img.onload = () => {
    const maxSide = 256;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    let sw = iw, sh = ih;
    if (Math.max(iw, ih) > maxSide) {
      const k = maxSide / Math.max(iw, ih);
      sw = Math.round(iw * k);
      sh = Math.round(ih * k);
    }
    const oc = document.createElement('canvas');
    oc.width = sw; oc.height = sh;
    const octx = oc.getContext('2d');
    octx.drawImage(img, 0, 0, sw, sh);
    const smallImg = oc;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, smallImg);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
    // Markér at WebGL tekstur er loadet
    webglTextureLoaded.value = true;
    checkIfAllLoaded();
  };
  gl.uniform1i(uTex, 0);

  let mouse = [0, 0];
  const onPointerMove = (e) => { mouse = [e.clientX, e.clientY]; };
  const onTouchMove = (e) => { if (e.touches && e.touches[0]) mouse = [e.touches[0].clientX, e.touches[0].clientY]; };
  
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  cleanupFunctions.push(() => window.removeEventListener('pointermove', onPointerMove));
  cleanupFunctions.push(() => window.removeEventListener('touchmove', onTouchMove));
  
  const getPixelRatio = () => Math.min(window.devicePixelRatio || 1, 1.5);

  function resize() {
    const ratio = getPixelRatio();
    const w = Math.floor(window.innerWidth * ratio);
    const h = Math.floor(window.innerHeight * ratio);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize, { passive: true });
  cleanupFunctions.push(() => window.removeEventListener('resize', resize));
  resize();

  let last = performance.now();
  let running = true;
  let fpsLimit = 60;
  let minFrameTime = 1000 / fpsLimit;

  const onVisibilityChange = () => { running = !document.hidden; };
  document.addEventListener('visibilitychange', onVisibilityChange);
  cleanupFunctions.push(() => document.removeEventListener('visibilitychange', onVisibilityChange));

  function frame(now) {
    if (!running) {
      animationFrameId = requestAnimationFrame(frame);
      last = now;
      return;
    }
    const dt = now - last;
    if (dt >= minFrameTime) {
      last = now;
      const seconds = now * 0.001;
      resize();
      gl.uniform1f(uTime, seconds);
      gl.uniform2f(uMouse, mouse[0], mouse[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    animationFrameId = requestAnimationFrame(frame);
  }
  animationFrameId = requestAnimationFrame(frame);
  
  // --------------- SLUT: WebGL Initialisering ---------------

  // Tilføj scroll event listener for fade-out og blur effekt
  let scrollTimeout = null;
  const handleScroll = () => {
    if (isMobile.value && scrollTimeout) return;
    
    const executeScroll = () => {
      const scrollPosition = window.scrollY;
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

      const viewerWrapper = document.querySelector('.viewer-wrapper');
      if (viewerWrapper) {
        const viewerRect = viewerWrapper.getBoundingClientRect();
        const viewerBottom = viewerRect.bottom;
        const windowHeight = window.innerHeight;
        const blurStartOffset = windowHeight * 0.7;
        const blurEndOffset = windowHeight * 0.3;
        
        if (viewerBottom > blurStartOffset) {
          viewerBlur.value = 0;
          viewerBrightness.value = 1;
        } else if (viewerBottom < blurEndOffset) {
          viewerBlur.value = 8;
          viewerBrightness.value = 0.5;
        } else {
          const blurProgress = 1 - (viewerBottom - blurEndOffset) / (blurStartOffset - blurEndOffset);
          viewerBlur.value = blurProgress * 8;
          viewerBrightness.value = 1 - (blurProgress * 0.5);
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
  
  cleanupFunctions.push(() => window.removeEventListener('scroll', handleScroll));
  cleanupFunctions.push(() => window.removeEventListener('resize', updateMobileStatus));
});

onUnmounted(() => {
  // Stop animationsloopet
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  // Kør alle oprydningsfunktioner (fjerner event listeners)
  cleanupFunctions.forEach(cleanup => cleanup());
});


if (typeof window !== 'undefined') {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  
  window.addEventListener('load', () => {
    window.scrollTo(0, 0);
  });
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.scrollTo(0, 0);
    });
  } else {
    window.scrollTo(0, 0);
  }
}

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

const imageList = computed(() => {
  return isMobile.value ? allImages.slice(0, 5) : allImages;
});
</script>

<template>
  <div id="app">
    <!-- Preloader -->
    <Preloader 
      v-if="showPreloader"
      ref="preloaderRef"
      :is-loading="isLoading"
      @complete="handlePreloaderComplete"
    />
    
    <!-- WebGL Canvas baggrund -->
    <canvas ref="webglCanvas" class="background-canvas"></canvas>
    
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
        @images-loaded="handleSpiralImagesLoaded"
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
  overflow-y: auto;
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

/* Opdateret til at style canvas i stedet for video/billede */
.background-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
  display: block;
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