<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import ImageViewer from './components/ImageViewer.vue';
import Navbar from './components/Navbar.vue';
import Preloader from './components/Preloader.vue';
// import FeatureBoxes from './components/FeatureBoxes.vue';
import FlowmateAI from './components/FlowmateAI.vue';
import FeatureBoxes4 from './components/FeatureBoxes4.vue';
import Quote from './components/Quote.vue';
import DomainCheck from './components/DomainCheck.vue';
import FAQ from './components/FAQ.vue';
import Footer from './components/Footer.vue';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { provideI18n, injectI18n } from './composables/useI18n';

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

// Provide i18n for all components
const i18n = provideI18n();
const { t } = i18n;


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
const imageViewerRef = ref(null);

// Refs til content management animation
const contentTitle = ref(null);
// const featureBoxes = ref(null);
const flowmateAIComponent = ref(null);
const featureBoxesHeader = ref(null);
const featureBoxes4Component = ref(null);
const quoteComponent = ref(null);
const domainCheckComponent = ref(null);
const faqComponent = ref(null);
const stackContainerRef = ref(null);

const updateMobileStatus = () => {
  isMobile.value = window.innerWidth <= 768;
};

// Handle når spiral billeder er loadet
const handleSpiralImagesLoaded = () => {
  spiralImagesLoaded.value = true;
  checkIfAllLoaded();
};

// Handle blur updates fra ImageViewer
const handleBlurUpdate = ({ blur, brightness }) => {
  viewerBlur.value = blur;
  viewerBrightness.value = brightness;
};

// Handle when ImageViewer is initialized
const handleImageViewerInitialized = () => {
  // Three.js is now initialized and GPU is warmed up
  // Refresh ScrollTrigger to pre-calculate positions
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
};

// Tjek om alt er loadet
const checkIfAllLoaded = () => {
  if (webglTextureLoaded.value && spiralImagesLoaded.value) {
    // GPU warmup is now handled automatically by ImageViewer when textures load
    // Vent på at progress bar når 100% (3s) + lidt ekstra tid
    // This gives time for GPU warmup to complete (warmup takes ~300-400ms for 20 frames)
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

  // Fjern preloader class så scrollbaren kan vises igen
  document.body.classList.remove('preloader-active');
  document.documentElement.classList.remove('preloader-active');

  // Fjern scrollbar-hiding style element
  const hideScrollbarStyle = document.getElementById('hide-scrollbar-temp');
  if (hideScrollbarStyle) {
    hideScrollbarStyle.remove();
  }

  // Nulstil scroll position før vi re-enable scrolling
  const resetScroll = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };
  resetScroll();

  // Re-enable scrolling - use overflow-x hidden, overflow-y auto
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  document.body.style.overflowX = 'hidden';
  document.body.style.overflowY = 'auto';
  document.documentElement.style.overflowX = 'hidden';
  document.documentElement.style.overflowY = 'auto';

  // Nulstil scroll igen efter scrolling er enabled
  requestAnimationFrame(() => {
    resetScroll();
    // Nulstil spiral position hvis den eksisterer
    if (window.flowmateCamera) {
      const camera = window.flowmateCamera;
      const initialZ = window.flowmateCameraInitialZ || 120;
      camera.position.z = initialZ;
      camera.position.y = 175;
      camera.lookAt(0, 0, 0);
      
      // Nulstil spiral rotation hvis den eksisterer
      if (window.flowmateSpiralGroup) {
        window.flowmateSpiralGroup.rotation.y = -Math.PI * 1.4;
      }
    }
    
    // Refresh ScrollTrigger efter scroll nulstilling
    ScrollTrigger.refresh();
  });

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

// Fragment Shader (OPTIMERET VERSION MED DOMAIN WARP)
const FS = `#version 100
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// --- Optimized Hash / noise -------------------------------------------------
// Optimized hash: using precomputed constants and simpler math
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Optimized noise: cached floor/fract, reduced operations
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    // Precompute offsets
    vec2 i1 = i + vec2(1.0, 0.0);
    vec2 i2 = i + vec2(0.0, 1.0);
    vec2 i3 = i + 1.0;
    
    float a = hash(i);
    float b = hash(i1);
    float c = hash(i2);
    float d = hash(i3);
    
    // Optimized smoothstep: f * f * (3.0 - 2.0 * f) = smootherstep approximation
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    // Single mix operation instead of nested
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// --- Domain warp -----------------------------------------------------------
vec2 warp(vec2 p) {
    float n = noise(p * 0.8 + u_time*0.075);
    float a = noise(p * 0.8 + 4.0 + u_time*0.1);
    float b = noise(p * 0.8 - 4.0 - u_time*0.1);
    return p + vec2(a, b) * 1.4 + n * 0.5;
}

void main() {
    // Precompute aspect ratio and time once
    float aspect = u_resolution.x / u_resolution.y;
    float t = u_time * 0.125;
    
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv -= 0.5;
    uv.x *= aspect;

    // Precompute rotation values
    float rotAngle = t * 0.6;
    float cs = cos(rotAngle);
    float sn = sin(rotAngle);
    uv = mat2(cs, -sn, sn, cs) * uv * 2.3;

    // Reduced from 3 warp layers to 2 (bevarer visuelt udtryk)
    // Første warp layer
    vec2 p1 = warp(uv);
    // Anden warp layer (kombinerer de to sidste layers)
    vec2 p2 = warp(mix(p1 * 0.85, p1 * 0.65, 0.5));

    // Optimized noise sampling: reduceret fra 3 til 2 samples
    float n1 = noise(p1 * 1.6);
    float n2 = noise(p2 * 1.8); // Kombineret værdi mellem 1.4 og 2.2
    
    // Weighted blend (bevarer samme visuelle balance)
    float v = n1 * 0.55 + n2 * 0.45;
    v = pow(v, 0.7);

vec3 a = vec3(0.98, 0.97, 0.94);  // blød hvid highlight – let varm, linen-agtig
vec3 b = vec3(0.93, 0.88, 0.80);  // creme/off-white stoftone
vec3 c = vec3(0.78, 0.70, 0.60);  // sandfarvet mellemtonedybde
vec3 d = vec3(0.45, 0.40, 0.34);  // dyb skygge i varm taupe/sand


    // Optimized color mixing: precompute smoothstep calls
    float s1 = smoothstep(0.1, 0.4, v);
    float s2 = smoothstep(0.4, 0.7, v);
    float s3 = smoothstep(0.7, 0.95, v);
    
    vec3 col = mix(a, b, s1);
    col = mix(col, c, s2);
    col = mix(col, d, s3);

    // vignette (svag)
    float vig = length(uv);
    col *= (1.0 - vig * 0.3);

    // Optimized grain: reduced resolution for better performance
    float grain = (hash(gl_FragCoord.xy) - 0.5) * 0.04;
    col += grain;

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
  // Disable scrolling mens preloader viser og skjul scrollbar
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  document.body.classList.add('preloader-active');
  document.documentElement.classList.add('preloader-active');

  // Tilføj styles til at skjule scrollbar direkte
  const style = document.createElement('style');
  style.id = 'hide-scrollbar-temp';
  style.textContent = `
    html::-webkit-scrollbar,
    body::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    html, body {
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
    }
  `;
  document.head.appendChild(style);

  // Sæt mobil status ved start
  updateMobileStatus();
  window.addEventListener('resize', updateMobileStatus);

  // Scroll til toppen med instant behavior - gentag flere gange for at sikre det virker
  const resetScroll = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };
  
  // Nulstil scroll position flere gange for at sikre det virker
  resetScroll();
  requestAnimationFrame(() => {
    resetScroll();
    requestAnimationFrame(() => {
      resetScroll();
    });
  });
  
  // Sikr også at scroll position er 0 ved page load
  if (window.scrollY > 0 || document.documentElement.scrollTop > 0 || document.body.scrollTop > 0) {
    resetScroll();
  }

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

      // Blur håndteres nu fuldt ud af ScrollTrigger i ImageViewer.vue
      // Ingen manuel blur kontrol her længere
      
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

  // GSAP ScrollTrigger animation for content management section
  // Vent lidt så elementerne er renderet
  setTimeout(() => {
    const contentSection = document.querySelector('.content-management-section');
    
    if (contentSection && contentTitle.value) {
      // Funktion til at opdele tekst i linjer baseret på faktisk rendering
      const splitTextIntoLines = (element) => {
        // Gem original HTML (kan indeholde <br> tags)
        const originalHTML = element.innerHTML;
        
        // Parse HTML'en og ekstraher både tekst og <br> tags
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalHTML;
        
        // Saml alle tekst-noder og <br> tags i rækkefølge
        const nodes = [];
        const walker = document.createTreeWalker(
          tempDiv,
          NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
          {
            acceptNode: (node) => {
              if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                return NodeFilter.FILTER_ACCEPT;
              }
              if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
                return NodeFilter.FILTER_ACCEPT;
              }
              return NodeFilter.FILTER_SKIP;
            }
          }
        );
        
        let node;
        while (node = walker.nextNode()) {
          nodes.push(node);
        }
        
        // Ryd elementet og genopbyg med spans for at måle faktiske linjer
        element.innerHTML = '';
        
        // Tilføj alle tekst-noder og <br> tags som spans/elementer
        nodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
            // Tilføj <br> som et element vi kan måle
            const br = document.createElement('br');
            element.appendChild(br);
          } else if (node.nodeType === Node.TEXT_NODE) {
            // Split tekst i ord og tilføj hvert ord som et span
            const text = node.textContent;
            const words = text.split(/\s+/).filter(w => w.length > 0);
            
            words.forEach((word, index) => {
              const span = document.createElement('span');
              span.textContent = word + (index < words.length - 1 ? ' ' : '');
              span.style.display = 'inline';
              element.appendChild(span);
            });
          }
        });
        
        // Mål faktiske linjer baseret på getBoundingClientRect
        const lines = [];
        let currentLine = [];
        let lastTop = null;
        
        // Gennemgå alle spans og br tags
        Array.from(element.children).forEach((child, index) => {
          if (child.tagName === 'BR') {
            // <br> tag betyder altid ny linje
            if (currentLine.length > 0) {
              lines.push(currentLine.join(' '));
              currentLine = [];
            }
            lastTop = null; // Reset så næste element starter ny linje
          } else {
            // Det er et span med tekst
            const rect = child.getBoundingClientRect();
            
            if (lastTop === null) {
              lastTop = rect.top;
            }
            
            if (Math.abs(rect.top - lastTop) > 5) {
              // Ny linje baseret på position
              if (currentLine.length > 0) {
                lines.push(currentLine.join(' '));
              }
              currentLine = [child.textContent.trim()];
              lastTop = rect.top;
            } else {
              // Samme linje
              currentLine.push(child.textContent.trim());
            }
          }
        });
        
        // Tilføj sidste linje
        if (currentLine.length > 0) {
          lines.push(currentLine.join(' '));
        }
        
        // Genopbyg elementet med line wrappers
        element.innerHTML = lines.map(line => 
          `<span class="line-wrapper"><span class="line">${line}</span></span>`
        ).join('');
        
        return element.querySelectorAll('.line');
      };
      
      // Gem original tekst INDEN vi splitter
      const originalText = contentTitle.value.textContent;
      
      // Opret en timeline for hele content management sektionen
      // Brug matchMedia for at håndtere pinning forskelligt på desktop vs mobil
      const mm = gsap.matchMedia();
      
      // Desktop: Pin sektionen + line stagger animation
      mm.add("(min-width: 769px)", () => {
        // Gendan original tekst først (vigtig ved HMR/reload)
        contentTitle.value.classList.remove('lines-ready');
        contentTitle.value.innerHTML = '';
        
        // Tjek om vi er på MacBook Pro 14" størrelse og indsæt linjeskift før "uden"
        let textToUse = originalText;
        const isMacBook14 = window.innerWidth >= 1440 && window.innerWidth <= 1700;
        if (isMacBook14 && textToUse.includes('uden')) {
          textToUse = textToUse.replace(' uden ', ' <br>uden ');
        }
        
        contentTitle.value.innerHTML = textToUse;
        
        // Vent på at DOM er klar før vi splitter
        requestAnimationFrame(() => {
          // Split teksten i linjer og få line elementer
          const lines = splitTextIntoLines(contentTitle.value);
          
          if (lines.length === 0) {
            console.error('❌ [CONTENT-TITLE] No lines found after split');
            return;
          }
          
          // Vent endnu en frame så line elementer er i DOM
          requestAnimationFrame(() => {
            // ALTID sæt initial state først - uanset scroll position
            // Brug inline styles direkte for at sikre de bliver sat
            lines.forEach((line, index) => {
              line.style.opacity = '0';
              line.style.transform = 'translateY(60px)';
            });
            
            // Marker at linjerne er klar - fjern CSS fallback
            contentTitle.value.classList.add('lines-ready');
            
            // Nu sæt GSAP state (dette vil override inline styles når animationen kører)
            gsap.set(lines, {
              y: 60,
              opacity: 0
            });
            
            // Vent endnu en frame så initial state er helt sat før ScrollTrigger evaluerer
            requestAnimationFrame(() => {
              // Vent endnu en frame for at sikre initial state er sat
              requestAnimationFrame(() => {
                // Tjek scroll position FØR vi opretter ScrollTrigger
                const rect = contentSection.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const triggerPoint = viewportHeight * 0.8;
                const alreadyPastTrigger = rect.top < triggerPoint && rect.bottom > 0;
                
                if (alreadyPastTrigger) {
                  // Vi er allerede forbi - animer med det samme
                  const immediateAnimation = gsap.to(lines, {
                    y: 0,
                    opacity: 1,
                    duration: 0.9,
                    stagger: 0.12,
                    ease: "power3.out",
                    clearProps: false, // Vigtig: ikke ryd properties efter animation
                  });
                } else {
                  // Track om animationen er startet for at undgå at refresh() forstyrrer den
                  let animationStarted = false;
                  let titleAnimation = null;
                  
                  // Opret ScrollTrigger med once: true
                  const titleTrigger = ScrollTrigger.create({
                    trigger: contentSection,
                    start: 'top 30%',
                    once: true,
                    markers: false,
                    invalidateOnRefresh: false,
                    onEnter: () => {
                      // Marker at animationen er startet
                      animationStarted = true;
                      
                      // Animér hver linje op med stagger - gem animationen
                      titleAnimation = gsap.to(lines, {
                        y: 0,
                        opacity: 1,
                        duration: 0.9,
                        stagger: 0.12,
                        ease: "power3.out",
                        clearProps: false, // Vigtig: ikke ryd properties efter animation
                      });
                    },
                    onRefresh: () => {
                      // Hvis animationen allerede er startet, ignorer refresh
                      if (animationStarted) {
                        return;
                      }
                      
                      // Ved refresh, tjek om vi allerede er forbi trigger punktet
                      const refreshRect = contentSection.getBoundingClientRect();
                      const refreshViewportHeight = window.innerHeight;
                      const refreshTriggerPoint = refreshViewportHeight * 0.8;
                      
                      if (refreshRect.top < refreshTriggerPoint && refreshRect.bottom > 0) {
                        // Marker at animationen er startet
                        animationStarted = true;
                        // Vi er allerede forbi - animer med det samme
                        titleAnimation = gsap.to(lines, {
                          y: 0,
                          opacity: 1,
                          duration: 0.9,
                          stagger: 0.12,
                          ease: "power3.out",
                          clearProps: false, // Vigtig: ikke ryd properties efter animation
                        });
                        // Kill trigger så den ikke trigger igen
                        titleTrigger.kill();
                      }
                    }
                  });
                  
                  // Refresh ScrollTrigger efter setup - men kun hvis animationen ikke er startet
                  setTimeout(() => {
                    if (!animationStarted) {
                      ScrollTrigger.refresh();
                    }
                  }, 100);
                }
              });
            });
          });
        });
        
        // Pin timeline (uændret)
        const contentTimeline = gsap.timeline({
          ease: "expo.inOut",
          scrollTrigger: {
            trigger: contentSection,
            start: 'top top',
            end: '+=100%',
            scrub: 2,
            pin: true,
            anticipatePin: 0.5,
            id: 'content-management-pin',
          }
        });

        // Fase 1: Vis indholdet (0-40% af scrollet)
        contentTimeline.to({}, { duration: 0.4, ease: "expo.inOut" });

        // Fase 3: Hold sektionen pinned resten af vejen (zoom-out håndteres i ImageViewer.vue)
        contentTimeline.to({}, { duration: 0.5, ease: "expo.inOut" }, 0.7);
      });
      
      // Mobil: Kun pinning, ingen animation
      mm.add("(max-width: 768px)", () => {
        const contentTimeline = gsap.timeline({
          ease: "expo.inOut",
          scrollTrigger: {
            trigger: contentSection,
            start: 'top top',
            end: '+=100%',
            scrub: 2,
            pin: false, // Ingen pinning på mobil
            id: 'content-management-pin',
          }
        });

        // Fase 1: Vis indholdet (0-40% af scrollet)
        contentTimeline.to({}, { duration: 0.4, ease: "expo.inOut" });

        // Fase 3: Hold sektionen pinned resten af vejen (zoom-out håndteres i ImageViewer.vue)
        contentTimeline.to({}, { duration: 0.5, ease: "expo.inOut" }, 0.7);
      });
      
      // Ryd op i matchMedia når komponenten unmountes
      cleanupFunctions.push(() => mm.revert());
    }

    // Scroll-baseret farvetransition for FlowmateAI header tekst
    // Starter når man scroller forbi content-sektionen
    // Hvert bogstav transitioner sekventielt fra grå → hvid
    if (flowmateAIComponent.value && flowmateAIComponent.value.headerText && contentSection) {
      const flowmateAIHeader = flowmateAIComponent.value.headerText;
      const flowmateAISection = flowmateAIHeader.closest('.next-section');
      
      if (flowmateAISection) {
        // Find alle bogstav-spans
        const charSpans = flowmateAIHeader.querySelectorAll('.char-span');
        const totalChars = charSpans.length;
        
        if (totalChars > 0) {
          // Sæt initial state til grå for alle bogstaver
          gsap.set(charSpans, {
            color: '#808080' // Grå
          });

          // Opret ScrollTrigger for farvetransition
          // Starter når FlowmateAI sektionen kommer ind i viewport efter content-sektionen
          ScrollTrigger.create({
            trigger: flowmateAISection,
            start: 'top 90%', // Starter senere - når toppen af sektionen nærmer sig viewport
            end: 'top -1%',  // Slutter senere - giver mere scroll-tid
            scrub: 1,         // Smooth scroll-baseret animation
            onUpdate: (self) => {
              const progress = self.progress;
              
              // Gennemgå hvert bogstav og beregn dets farve baseret på scroll progress
              charSpans.forEach((span, index) => {
                // Hvert bogstav starter sin transition baseret på sin position i teksten
                // Transition varighed per bogstav (hvor meget scroll hvert bogstav bruger)
                // Starter senere ved at tilføje en offset
                const startOffset = 0.3; // Start animationen 30% senere
                const transitionDuration = 0.7 / totalChars; // 70% af total scroll fordelt på alle bogstaver
                const charStartProgress = startOffset + (index / totalChars) * 0.7; // Start når scroll når dette punkt
                const charEndProgress = charStartProgress + transitionDuration;
                
                // Beregn hvor langt dette specifikke bogstav er i sin transition (0-1)
                let charProgress = 0;
                if (progress >= charStartProgress) {
                  if (progress >= charEndProgress) {
                    charProgress = 1; // Transition færdig
                  } else {
                    // Transition i gang
                    charProgress = (progress - charStartProgress) / transitionDuration;
                  }
                }
                
                // Clamp til 0-1
                charProgress = Math.max(0, Math.min(1, charProgress));
                
                // Transition fra grå → hvid (uden grøn farve)
                const gray = Math.round(128 + (255 - 128) * charProgress);
                gsap.set(span, {
                  color: `rgb(${gray}, ${gray}, ${gray})`
                });
              });
            }
          });
        }
      }
    }

    // Animation for FlowmateAI description tekst - fade-in fra neden
    if (flowmateAIComponent.value && flowmateAIComponent.value.descriptionText) {
      const flowmateAIDescription = flowmateAIComponent.value.descriptionText;
      const flowmateAISection = flowmateAIDescription.closest('.next-section');
      
      if (flowmateAISection) {
        // Sæt initial state
        gsap.set(flowmateAIDescription, {
          opacity: 0,
          y: 50
        });

        // Opret ScrollTrigger for animation
        ScrollTrigger.create({
          trigger: flowmateAISection,
          start: 'top 30%',
          onEnter: () => {
            gsap.to(flowmateAIDescription, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out"
            });
          },
          once: true
        });
      }
    }

    // Scroll-baseret farvetransition for Feature Boxes header tekst
    // Samme animation som FlowmateAI header
    if (featureBoxesHeader.value) {
      const featureBoxesSection = featureBoxesHeader.value.closest('.feature-boxes-section');
      
      if (featureBoxesSection) {
        // Find alle bogstav-spans
        const charSpans = featureBoxesHeader.value.querySelectorAll('.char-span');
        const totalChars = charSpans.length;
        
        if (totalChars > 0) {
          // Sæt initial state til grå for alle bogstaver
          gsap.set(charSpans, {
            color: '#808080' // Grå
          });

          // Opret ScrollTrigger for farvetransition
          ScrollTrigger.create({
            trigger: featureBoxesSection,
            start: 'top 90%', // Starter senere - når toppen af sektionen nærmer sig viewport
            end: 'top -1%',  // Slutter senere - giver mere scroll-tid
            scrub: 1,         // Smooth scroll-baseret animation
            onUpdate: (self) => {
              const progress = self.progress;
              
              // Gennemgå hvert bogstav og beregn dets farve baseret på scroll progress
              charSpans.forEach((span, index) => {
                // Hvert bogstav starter sin transition baseret på sin position i teksten
                const startOffset = 0.3; // Start animationen 30% senere
                const transitionDuration = 0.7 / totalChars; // 70% af total scroll fordelt på alle bogstaver
                const charStartProgress = startOffset + (index / totalChars) * 0.7; // Start når scroll når dette punkt
                const charEndProgress = charStartProgress + transitionDuration;
                
                // Beregn hvor langt dette specifikke bogstav er i sin transition (0-1)
                let charProgress = 0;
                if (progress >= charStartProgress) {
                  if (progress >= charEndProgress) {
                    charProgress = 1; // Transition færdig
                  } else {
                    // Transition i gang
                    charProgress = (progress - charStartProgress) / transitionDuration;
                  }
                }
                
                // Clamp til 0-1
                charProgress = Math.max(0, Math.min(1, charProgress));
                
                // Transition fra grå → hvid (uden grøn farve)
                const gray = Math.round(128 + (255 - 128) * charProgress);
                gsap.set(span, {
                  color: `rgb(${gray}, ${gray}, ${gray})`
                });
              });
            }
          });
        }
      }
    }

    // Animation for Feature Boxes 4 - ikoner, overskrifter og beskrivelser - fade-in fra neden
    if (featureBoxes4Component.value && featureBoxesHeader.value) {
      const featureBoxesSection = featureBoxesHeader.value.closest('.feature-boxes-section');
      
      if (featureBoxesSection) {
        // Saml alle elementer per feature box
        const featureBoxes = [
          {
            icon: featureBoxes4Component.value.icon1,
            title: featureBoxes4Component.value.title1,
            description: featureBoxes4Component.value.description1
          },
          {
            icon: featureBoxes4Component.value.icon2,
            title: featureBoxes4Component.value.title2,
            description: featureBoxes4Component.value.description2
          },
          {
            icon: featureBoxes4Component.value.icon3,
            title: featureBoxes4Component.value.title3,
            description: featureBoxes4Component.value.description3
          },
          {
            icon: featureBoxes4Component.value.icon4,
            title: featureBoxes4Component.value.title4,
            description: featureBoxes4Component.value.description4
          }
        ].filter(box => box.icon && box.title && box.description); // Fjern null værdier
        
        if (featureBoxes.length > 0) {
          // Sæt initial state med det samme (CSS sætter også opacity: 0, men GSAP skal vide om transform)
          featureBoxes.forEach(box => {
            gsap.set([box.icon, box.title, box.description], {
              opacity: 0,
              y: 50,
              visibility: 'hidden',
              force3D: true,
              immediateRender: true
            });
          });

          // Opret ScrollTrigger for animation
          ScrollTrigger.create({
            trigger: featureBoxesSection,
            start: 'top 40%',
            onEnter: () => {
              // Animér hver feature box sekventielt (ikon starter lidt før titel og beskrivelse)
              const tl = gsap.timeline();
              featureBoxes.forEach((box, index) => {
                const baseDelay = index * 0.15; // 0.15s delay mellem hver feature box
                // Ikon starter lidt før (0.05s tidligere), men aldrig før timeline starter
                const iconDelay = Math.max(0, baseDelay - 0.05);
                // Sæt visibility til visible samtidig med at animationen starter
                tl.set(box.icon, { visibility: 'visible' }, iconDelay);
                tl.to(box.icon, {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  ease: "power3.out",
                  force3D: true
                }, iconDelay);
                // Titel og beskrivelse starter sammen
                tl.set([box.title, box.description], { visibility: 'visible' }, baseDelay);
                tl.to([box.title, box.description], {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  ease: "power3.out",
                  force3D: true
                }, baseDelay);
              });
            },
            once: true
          });
        }
      }
    }

    // Scroll-baseret farvetransition for Quote tekst
    // Samme animation som FlowmateAI og Feature Boxes header
    if (quoteComponent.value && quoteComponent.value.quoteText) {
      const quoteTextElement = quoteComponent.value.quoteText;
      const quoteSection = quoteTextElement.closest('.quote-section');
      
      if (quoteSection) {
        // Find alle bogstav-spans
        const charSpans = quoteTextElement.querySelectorAll('.char-span');
        const totalChars = charSpans.length;
        
        if (totalChars > 0) {
          // Sæt initial state til grå for alle bogstaver
          gsap.set(charSpans, {
            color: '#808080' // Grå
          });

          // Opret ScrollTrigger for farvetransition
          ScrollTrigger.create({
            trigger: quoteSection,
            start: 'top 90%', // Starter senere - når toppen af sektionen nærmer sig viewport
            end: 'top -1%',  // Slutter senere - giver mere scroll-tid
            scrub: 1,         // Smooth scroll-baseret animation
            onUpdate: (self) => {
              const progress = self.progress;
              
              // Gennemgå hvert bogstav og beregn dets farve baseret på scroll progress
              charSpans.forEach((span, index) => {
                // Hvert bogstav starter sin transition baseret på sin position i teksten
                const startOffset = 0.3; // Start animationen 30% senere
                const transitionDuration = 0.7 / totalChars; // 70% af total scroll fordelt på alle bogstaver
                const charStartProgress = startOffset + (index / totalChars) * 0.7; // Start når scroll når dette punkt
                const charEndProgress = charStartProgress + transitionDuration;
                
                // Beregn hvor langt dette specifikke bogstav er i sin transition (0-1)
                let charProgress = 0;
                if (progress >= charStartProgress) {
                  if (progress >= charEndProgress) {
                    charProgress = 1; // Transition færdig
                  } else {
                    // Transition i gang
                    charProgress = (progress - charStartProgress) / transitionDuration;
                  }
                }
                
                // Clamp til 0-1
                charProgress = Math.max(0, Math.min(1, charProgress));
                
                // Transition fra grå → hvid (uden grøn farve)
                const gray = Math.round(128 + (255 - 128) * charProgress);
                gsap.set(span, {
                  color: `rgb(${gray}, ${gray}, ${gray})`
                });
              });
            }
          });
        }
      }
    }


    // Scroll-baseret farvetransition for Domain Check header tekst
    // Samme animation som de andre header tekster
    if (domainCheckComponent.value && domainCheckComponent.value.domainCheckHeader) {
      const domainCheckHeaderElement = domainCheckComponent.value.domainCheckHeader;
      const domainCheckSection = domainCheckHeaderElement.closest('.domain-check-section');
      
      if (domainCheckSection) {
        // Find alle bogstav-spans
        const charSpans = domainCheckHeaderElement.querySelectorAll('.char-span');
        const totalChars = charSpans.length;
        
        if (totalChars > 0) {
          // Sæt initial state til grå for alle bogstaver
          gsap.set(charSpans, {
            color: '#808080' // Grå
          });

          // Opret ScrollTrigger for farvetransition
          ScrollTrigger.create({
            trigger: domainCheckSection,
            start: 'top 90%', // Starter tidligere - når toppen af sektionen nærmer sig viewport
            end: 'top -1%',   // Slutter meget tidligere - giver mindre scroll-tid
            scrub: 1,         // Smooth scroll-baseret animation
            onUpdate: (self) => {
              const progress = self.progress;
              
              // Gennemgå hvert bogstav og beregn dets farve baseret på scroll progress
              charSpans.forEach((span, index) => {
                // Hvert bogstav starter sin transition baseret på sin position i teksten
                const startOffset = 0.05; // Start animationen 5% senere (tidligere end før)
                const transitionDuration = 0.75 / totalChars; // 75% af total scroll fordelt på alle bogstaver
                const charStartProgress = startOffset + (index / totalChars) * 0.75; // Start når scroll når dette punkt
                const charEndProgress = charStartProgress + transitionDuration;
                
                // Beregn hvor langt dette specifikke bogstav er i sin transition (0-1)
                let charProgress = 0;
                if (progress >= charStartProgress) {
                  if (progress >= charEndProgress) {
                    charProgress = 1; // Transition færdig
                  } else {
                    // Transition i gang
                    charProgress = (progress - charStartProgress) / transitionDuration;
                  }
                }
                
                // Clamp til 0-1
                charProgress = Math.max(0, Math.min(1, charProgress));
                
                // Transition fra grå → hvid (uden grøn farve)
                const gray = Math.round(128 + (255 - 128) * charProgress);
                gsap.set(span, {
                  color: `rgb(${gray}, ${gray}, ${gray})`
                });
              });
            }
          });
        }
      }
    }

    // Animation for Domain Check line - animerer fra kolonne 1 til 13
    if (domainCheckComponent.value && domainCheckComponent.value.animatedLine) {
      const animatedLineElement = domainCheckComponent.value.animatedLine;
      const domainCheckSection = animatedLineElement.closest('.domain-check-section');
      
      if (domainCheckSection && animatedLineElement) {
        // Sæt initial state - linjen er skjult (scaleX 0)
        gsap.set(animatedLineElement, {
          scaleX: 0
        });

        // Opret ScrollTrigger der animerer én gang når sektionen kommer ind i viewport
        ScrollTrigger.create({
          trigger: domainCheckSection,
          start: 'top 20%',
          once: true, // Kør kun én gang
          onEnter: () => {
            // Animer linjen fra scaleX(0) til scaleX(1) med ease
            gsap.to(animatedLineElement, {
              scaleX: 1,
              duration: 1.2,
              ease: 'power2.out' // Smooth easing
            });
          }
        });
      }
    }

    // Animation for Domain Check - overskrift, input, knap og note - fade-in fra neden
    if (domainCheckComponent.value && domainCheckComponent.value.domainCheckHeader) {
      const domainCheckHeaderElement = domainCheckComponent.value.domainCheckHeader;
      const domainCheckSection = domainCheckHeaderElement.closest('.domain-check-section');
      
      if (domainCheckSection) {
        const elements = [
          domainCheckComponent.value.checkTitle,
          domainCheckComponent.value.domainCheckForm,
          domainCheckComponent.value.domainNote
        ].filter(Boolean); // Fjern null værdier
        
        if (elements.length > 0) {
          // Sæt initial state for alle elementer
          elements.forEach(el => {
            gsap.set(el, {
              opacity: 0,
              y: 50
            });
          });

          // Opret ScrollTrigger for animation
          ScrollTrigger.create({
            trigger: domainCheckSection,
            start: 'top 60%',
            onEnter: () => {
              // Animér alle elementer samtidigt som én blok
              gsap.to(elements, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out"
              });
            },
            once: true
          });
        }
      }
    }

    // Scroll-baseret farvetransition for FAQ header tekst
    // Samme animation som de andre header tekster
    if (faqComponent.value && faqComponent.value.faqHeader) {
      const faqHeaderElement = faqComponent.value.faqHeader;
      const faqSection = faqHeaderElement.closest('.faq-section');
      
      if (faqSection) {
        // Find alle bogstav-spans
        const charSpans = faqHeaderElement.querySelectorAll('.char-span');
        const totalChars = charSpans.length;
        
        if (totalChars > 0) {
          // Sæt initial state til grå for alle bogstaver
          gsap.set(charSpans, {
            color: '#808080' // Grå
          });

          // Opret ScrollTrigger for farvetransition
          ScrollTrigger.create({
            trigger: faqSection,
            start: 'top 90%', // Starter tidligere - når toppen af sektionen nærmer sig viewport
            end: 'top -1%',  // Slutter senere - giver mere scroll-tid
            scrub: 1,         // Smooth scroll-baseret animation
            onUpdate: (self) => {
              const progress = self.progress;
              
              // Gennemgå hvert bogstav og beregn dets farve baseret på scroll progress
              charSpans.forEach((span, index) => {
                // Hvert bogstav starter sin transition baseret på sin position i teksten
                const startOffset = 0.05; // Start animationen 5% senere (tidligere end før)
                const transitionDuration = 0.75 / totalChars; // 75% af total scroll fordelt på alle bogstaver
                const charStartProgress = startOffset + (index / totalChars) * 0.75; // Start når scroll når dette punkt
                const charEndProgress = charStartProgress + transitionDuration;
                
                // Beregn hvor langt dette specifikke bogstav er i sin transition (0-1)
                let charProgress = 0;
                if (progress >= charStartProgress) {
                  if (progress >= charEndProgress) {
                    charProgress = 1; // Transition færdig
                  } else {
                    // Transition i gang
                    charProgress = (progress - charStartProgress) / transitionDuration;
                  }
                }
                
                // Clamp til 0-1
                charProgress = Math.max(0, Math.min(1, charProgress));
                
                // Transition fra grå → hvid (uden grøn farve)
                const gray = Math.round(128 + (255 - 128) * charProgress);
                gsap.set(span, {
                  color: `rgb(${gray}, ${gray}, ${gray})`
                });
              });
            }
          });
        }
      }
    }


    // Animation for FAQ kvadrater - samme som FlowmateAI description tekst
    if (faqComponent.value && faqComponent.value.faqHeader) {
      const faqHeaderElement = faqComponent.value.faqHeader;
      const faqSection = faqHeaderElement.closest('.faq-section');
      
      if (faqSection) {
        // Find alle FAQ kvadrater ved hjælp af querySelectorAll
        const faqSquaresArray = Array.from(faqSection.querySelectorAll('.faq-square'));
        
        if (faqSquaresArray.length > 0) {
          // Sæt initial state for alle kvadrater (samme som FlowmateAI description)
          faqSquaresArray.forEach(square => {
            gsap.set(square, {
              opacity: 0,
              y: 50
            });
          });

          // Opret ScrollTrigger for animation (samme som FlowmateAI description)
          ScrollTrigger.create({
            trigger: faqSection,
            start: 'top 30%',
            onEnter: () => {
              // Animér alle FAQ kvadrater samtidigt (samme som FlowmateAI description)
              gsap.to(faqSquaresArray, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out"
              });
            },
            once: true
          });
        }
      }
    }

    // Clip-path animation for FAQ image - animerer én gang når sektionen kommer ind i viewport
    if (faqComponent.value && faqComponent.value.faqImage) {
      const faqImageElement = faqComponent.value.faqImage;
      const faqSection = faqImageElement.closest('.faq-section');
      
      if (faqSection && faqImageElement) {
        // Sæt initial state - billedet er fuldt clipped fra toppen (0% højde)
        gsap.set(faqImageElement, {
          clipPath: 'inset(100% 0% 0% 0%)'
        });

        // Opret ScrollTrigger der animerer én gang når sektionen kommer ind i viewport
        ScrollTrigger.create({
          trigger: faqSection,
          start: 'top 80%',
          once: true, // Kør kun én gang
          onEnter: () => {
            // Animer clip-path fra 100% (fuldt clipped) til 0% (ingen clipping = 100% højde)
            gsap.to(faqImageElement, {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.5, // Langsom animation
              ease: 'power2.out' // Smooth easing
            });
          }
        });
      }
    }

    // Pin stack container på mobil
    if (stackContainerRef.value && isMobile.value) {
      ScrollTrigger.create({
        trigger: stackContainerRef.value,
        start: 'top top',
        end: '+=300vh',
        pin: true,
        pinSpacing: true,
      });
    }
    
    // Refresh ScrollTrigger efter alle animationer er sat op
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 50);
  }, 100);
});

onUnmounted(() => {
  // Stop animationsloopet
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  // Kør alle oprydningsfunktioner (fjerner event listeners)
  cleanupFunctions.forEach(cleanup => cleanup());
  // Ryd op ScrollTrigger instances
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
});


if (typeof window !== 'undefined') {
  // Disable browser scroll restoration
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  
  // Funktion til at nulstille scroll position og spiral
  const forceScrollReset = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Nulstil spiral position hvis den eksisterer
    if (window.flowmateCamera) {
      const camera = window.flowmateCamera;
      const initialZ = window.flowmateCameraInitialZ || 120;
      camera.position.z = initialZ;
      camera.position.y = 175; // Start højt oppe
      camera.lookAt(0, 0, 0);
    }
  };
  
  // Nulstil scroll ved page load
  window.addEventListener('load', () => {
    forceScrollReset();
    // Refresh ScrollTrigger når siden er loadet
    nextTick(() => {
      ScrollTrigger.refresh();
      // Nulstil scroll igen efter ScrollTrigger refresh
      forceScrollReset();
    });
  });
  
  // Nulstil scroll ved DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      forceScrollReset();
    });
  } else {
    forceScrollReset();
  }
  
  // Nulstil scroll ved beforeunload (før refresh)
  window.addEventListener('beforeunload', () => {
    forceScrollReset();
  });
  
  // Refresh ScrollTrigger ved resize
  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  });
}

// Opdel feature boxes header tekst i ord og derefter i bogstaver
const featureBoxesHeaderString = computed(() => t('features.title'));
const featureBoxesHeaderWords = computed(() => {
  const text = featureBoxesHeaderString.value;
  const words = [];
  let currentIndex = 0;
  
  // Split på mellemrum
  const parts = text.split(/\s+/);
  
  parts.forEach((part, index) => {
    if (part.length > 0) {
      words.push({
        chars: part.split(''),
        startIndex: currentIndex,
        isSpace: false
      });
      currentIndex += part.length;
      
      // Tilføj mellemrum efter hvert ord (undtagen det sidste)
      if (index < parts.length - 1) {
        words.push({
          chars: [' '],
          startIndex: currentIndex,
          isSpace: true
        });
        currentIndex += 1;
      }
    }
  });
  
  return words;
});

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
    <header class="header-section max-sm:-mt-8">
      <div class="grid-container grid max-sm:grid-cols-6">
        <div class="hero-content max-sm:col-span-6 max-sm:col-start-1">
          <p class="text-xs sm:text-sm font-medium tracking-wider uppercase text-white/70 mb-6" :style="{ opacity: heroOpacity, filter: `blur(${heroBlur}px)` }">{{ t('hero.eyebrow') }}</p>
          <h1 class="text-[2.25rem] sm:text-[3rem] md:text-[4rem] xl:text-[6rem] font-bold leading-[1.1] mb-6 text-white tracking-[-0.02em]" :style="{ opacity: heroOpacity, filter: `blur(${heroBlur}px)` }">{{ t('hero.title') }}</h1>
          <p class="text-[0.95rem] sm:text-base lg:text-lg xl:text-xl leading-relaxed text-white/90 font-normal max-sm:max-w-[calc(83.333%-0.75rem)]" :style="{ opacity: heroOpacity, filter: `blur(${heroBlur}px)` }">{{ t('hero.subtitle') }}</p>
        </div>
      </div>
      
      <!-- Stack Container - kun på mobil, UNDER grid-containeren -->
      <div ref="stackContainerRef" class="hidden max-sm:block w-full max-sm:h-[70vh] border-2 border-[#00ffff] relative"></div>
    </header>

    <!-- Scroll indicator - fixed i bunden -->
    <div 
      class="scroll-indicator fixed bottom-6 sm:bottom-8 md:bottom-10 lg:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[1000] group"
      :style="{ opacity: heroOpacity }"
    >
      <p class="text-xs sm:text-sm font-medium tracking-wider uppercase text-white/70 m-0 group-hover:text-[rgb(199,179,153)] transition-colors">{{ t('hero.scroll') }}</p>
      <div class="flex flex-col gap-1 items-center">
        <span class="scroll-line w-6 h-[0.1rem] bg-white/70 rounded-sm group-hover:bg-[rgb(199,179,153)] transition-colors" style="animation-delay: 0s"></span>
        <span class="scroll-line w-6 h-[0.1rem] bg-white/70 rounded-sm group-hover:bg-[rgb(199,179,153)] transition-colors" style="animation-delay: 0.15s"></span>
        <span class="scroll-line w-6 h-[0.1rem] bg-white/70 rounded-sm group-hover:bg-[rgb(199,179,153)] transition-colors" style="animation-delay: 0.3s"></span>
      </div>
    </div>

    <!-- Vagt-element der markerer toppen/starten af scroll-zonen -->
    <div id="viewer-top-sentinel" style="height: 1px;"></div>

    <!-- Wrapper for sticky scroll effekt -->
    <div 
      class="viewer-wrapper"
      :style="{ minHeight: `calc(${(imageList.length + 1) * 350}px + 120vh)` }"
    >
      <ImageViewer 
        ref="imageViewerRef"
        :key="`viewer-${isMobile}`"
        :images="imageList" 
        :start-index="startIndex" 
        :visible="true"
        :video-src="'https://flowmate.dk/wp-content/uploads/2025/05/flowmate-video-editor.mp4'"
        :blur-amount="viewerBlur"
        :brightness="viewerBrightness"
        :is-mobile="isMobile"
        :pre-initialize="true"
        @images-loaded="handleSpiralImagesLoaded"
        @update-blur="handleBlurUpdate"
        @initialized="handleImageViewerInitialized"
      />
    </div>

    <!-- Vagt-element der markerer bunden/slutningen af scroll-zonen -->
    <div id="viewer-bottom-sentinel" style="height: 1px;"></div>

    <!-- Content Management sektion -->
    <section class="content-management-section">
      <div class="grid-container">
        <div class="content-management-wrapper">
          <div class="content-left">
           
            <h2 ref="contentTitle" class="content-title">
              {{ t('content.title') }}
            </h2>
          </div>
        </div>

        <!-- Feature boxes -->
        <!-- <FeatureBoxes ref="featureBoxes" /> -->
      </div>
    </section>

    <!-- Flowmate AI Section -->
    <FlowmateAI ref="flowmateAIComponent" />

    <!-- Feature Boxes Section -->
    <section class="feature-boxes-section w-full min-h-screen relative bg-transparent pt-0 pb-24 flex items-center lg:pt-0 lg:pb-20 md:pt-0 md:pb-16 sm:pt-0 sm:pb-12 -mt-[40rem] lg:-mt-[30rem] md:-mt-[20rem] sm:-mt-[15rem] max-sm:-mt-16 z-0">
      <div class="grid-container mt-48 lg:mt-80 md:mt-32 sm:mt-24 max-sm:-mt-8">
        <p class="row-start-1 col-start-1 col-span-4 lg:col-start-1 lg:col-span-5 md:col-start-1 md:col-span-12 max-sm:col-start-1 max-sm:col-span-6 text-xs sm:text-sm font-medium tracking-wider uppercase text-white/70 mb-0 lg:mb-0 md:mb-6 max-sm:mb-6">{{ t('features.eyebrow') }}</p>
        <h2 ref="featureBoxesHeader" class="row-start-3 col-start-1 col-span-4 lg:row-start-2 lg:col-start-1 lg:col-span-5 md:col-start-1 md:col-span-12 max-sm:col-[1/6] text-[4.5rem] lg:text-[3rem] md:text-[2.5rem] sm:text-[2rem] max-sm:text-[1.5rem] font-bold leading-[1.2] mb-0 lg:mb-0 md:mb-10 text-white feature-boxes-header">
          <span v-for="(word, wordIndex) in featureBoxesHeaderWords" :key="wordIndex" class="word-wrapper" :class="{ 'space-wrapper': word.isSpace }" :data-word-index="wordIndex">
            <span v-for="(char, charIndex) in word.chars" :key="charIndex" :data-index="word.startIndex + charIndex" class="char-span">
              {{ char === ' ' ? '\u00A0' : char }}
            </span>
          </span>
        </h2>
        <FeatureBoxes4 ref="featureBoxes4Component" />
      </div>
    </section>

    <!-- Quote Section -->
    <Quote ref="quoteComponent" />

    <!-- Domain Check Section -->
    <DomainCheck ref="domainCheckComponent" />

    <!-- FAQ Section -->
    <FAQ ref="faqComponent" />

    <!-- Footer -->
    <Footer />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Skjul scrollbar under preloader/warm-up */
body.preloader-active,
html.preloader-active {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

body.preloader-active::-webkit-scrollbar,
html.preloader-active::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
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
  scroll-behavior: smooth;
  scroll-padding-top: 0;
}

html, body {
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  scroll-behavior: smooth;
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
  margin: 0rem 5rem; /* Flyt op med -2rem, behold 5rem margin til venstre og højre */
}

@media (max-width: 1024px) {
  .grid-container {
    width: calc(100% - 8rem); /* 4rem på hver side */
    margin: -2rem 4rem 0;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(6, 1fr);
    width: calc(100% - 5rem); /* 2.5rem på hver side */
    margin: -2rem 2.5rem 0;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .grid-container {
    grid-template-columns: repeat(6, 1fr);
    width: calc(100% - 3rem); /* 1.5rem på hver side */
    margin: -2rem 1.5rem 0;
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
  flex-direction: column;
  top: 38rem;
  justify-content: flex-start;
}

/* Mobil: Juster header-sektionens højde */
@media (max-width: 640px) {
  .header-section {
    height: auto; /* Ændr til auto eller en specifik højde som f.eks. 50vh */
    min-height: 20vh; /* Minimum højde på mobil */
  }
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
  display: grid;
  place-items: center;

}

.content-management-wrapper {
  display: contents; 
  
}

.content-management-section .grid-container {
  margin-top: -10rem;
}

.content-left {
  display: contents; /* Gør at children (title, description, video) bruger grid */
}

.content-eyebrow {
  grid-column: 1 / 7;
  grid-row: 1;
}

.content-title {
  font-size: 4.5rem;
  font-weight: 700;
  line-height: 1.1;
 
  color: #ffffff;
 
  text-align: center;
  grid-row: 2;
  grid-column: 2 / 12; /* Spænder over kolonner 1-5 */
}

/* MacBook Pro 14" specifik styling */
@media (min-width: 1440px) and (max-width: 1700px) {
  .content-title {
    font-size: 4rem; /* Lidt mindre font-size */
    grid-column: 1 / 13;
     /* Bredere - spænder over alle 12 kolonner */
  }
}

/* Line wrapper for stagger animation */
.content-title .line-wrapper {
  display: block;
  overflow: hidden;
}

.content-title .line {
  display: block;
  will-change: transform, opacity;
}

/* Desktop: Start med skjulte linjer - CSS fallback */
@media (min-width: 769px) {
  .content-title:not(.lines-ready) .line {
    opacity: 0;
    transform: translateY(60px);
  }
}


/* Char span styling for scroll-baseret animation */
.char-span {
  display: inline-block;
  transition: color 0.1s ease-out;
}

/* Forhindre ord i at blive brudt ved linjeskift */
.feature-boxes-header .word-wrapper {
  display: inline-block;
  white-space: nowrap;
}

/* Forhindre ord i at blive brudt på mobil for feature boxes header */
@media (max-width: 640px) {
  .feature-boxes-header .char-span {
    white-space: normal;
  }
  .feature-boxes-header {
    word-break: normal;
    hyphens: none;
    overflow-wrap: break-word;
  }
}

/* Fix ekstra mellemrum på MacBook Pro 14" (ca. 1024px) */
@media (min-width: 1024px) and (max-width: 1700px) {
  .feature-boxes-header {
    font-size: 2.5rem !important;
  }
  /* Reducer bredden af alle mellemrum-wrappers for at fikse ekstra mellemrum ved linjeskift */
  .feature-boxes-header .word-wrapper.space-wrapper {
    width: 0.25em;
    overflow: hidden;
    display: inline-block;
  }
}

/* FeatureBoxes styling - gør komponenten transparent for grid */
.content-management-section .feature-boxes-container {
  display: contents;
}

/* Responsive design for content management section */
@media (max-width: 1024px) {
  .content-management-section {
    padding: 80px 0 0;
  }
  
  .content-management-section .grid-container {
    margin-top: -3rem;
  }
  
  .content-eyebrow {
    grid-column: 1 / 8;
  }
  
  .content-title {
    font-size: 3rem;
    grid-column: 1 / 8; /* Spænder over kolonner 1-7 */
  }
}

@media (max-width: 768px) {
  .content-management-section {
    padding: 60px 0 0;
  }

  .content-management-section .grid-container {
    margin-top: -2rem;
  }

  .content-eyebrow {
    grid-column: 1 / 7; /* Spænder over alle 6 kolonner */
  }

  .content-title {
    font-size: 2rem;
    line-height: 1.2;
    grid-column: 1 / 7; /* Spænder over alle 6 kolonner */
    padding: 0 1rem;
    white-space: normal;
  }

  .content-management-section .feature-boxes-container {
    margin-top: 3rem;
  }
}

@media (max-width: 480px) {
  .content-management-section {
    padding: 40px 0 0;
  }

  .content-management-section .grid-container {
    margin-top: -1.5rem;
  }

  .content-title {
    font-size: 1.7rem;
    line-height: 1.3;
    grid-column: 1 / 7; /* Spænder over alle 6 kolonner */
    padding: 0 1.5rem;
    white-space: normal;
    
  }

  .content-management-section .feature-boxes-container {
    margin-top: 2rem;
  }
}

</style>