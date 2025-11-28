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

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);


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

// Refs til content management animation
const contentTitle = ref(null);
// const featureBoxes = ref(null);
const flowmateAIComponent = ref(null);
const featureBoxesHeader = ref(null);
const featureBoxes4Component = ref(null);
const quoteComponent = ref(null);
const domainCheckComponent = ref(null);
const faqComponent = ref(null);

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
  
  // Scroll kun 10% ned og så op igen
  tl.to(window, {
    scrollTo: maxScroll * 0.2, // Kun 10% ned
    duration: 0.3,
    ease: 'none'
  })
  .to(window, {
    scrollTo: 0, // Tilbage til top
    duration: 0.3,
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

  // Fjern preloader class så scrollbaren kan vises igen
  document.body.classList.remove('preloader-active');
  document.documentElement.classList.remove('preloader-active');

  // Fjern scrollbar-hiding style element
  const hideScrollbarStyle = document.getElementById('hide-scrollbar-temp');
  if (hideScrollbarStyle) {
    hideScrollbarStyle.remove();
  }

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

vec3 a = vec3(2.60, 0.85, 1.00);  // overfladelys blå
vec3 b = vec3(0.15, 0.45, 0.70);  // ocean mid-depth
vec3 c = vec3(0.05, 0.20, 0.35);  // dybhavsblå
vec3 d = vec3(0.01, 0.04, 0.08);  // absolut abyss mørke

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
    
    if (contentSection && contentTitle.value) { // && featureBoxes.value) {
      // Animér hver linje i content-title op når man scroller til sektionen
      const titleLines = contentTitle.value.querySelectorAll('.content-title-line');
      
      // Sæt initial state for alle linjer
      if (titleLines.length > 0) {
        gsap.set(titleLines, {
          opacity: 0,
          y: 50
        });

        // Opret en separat timeline der trigger når sektionen nærmer sig viewport
        ScrollTrigger.create({
          trigger: contentSection,
          start: 'top 80%',
          onEnter: () => {
            // Animér hver linje sekventielt op
            const tl = gsap.timeline();
            titleLines.forEach((line, index) => {
              tl.to(line, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out"
              }, index * 0.2); // 0.2s delay mellem hver linje
            });
          },
          once: true,
          markers: false // Sæt til true for debugging
        });
      }

      // Opret en timeline for hele content management sektionen
      const contentTimeline = gsap.timeline({
        ease: "expo.inOut",
        scrollTrigger: {
          trigger: contentSection,
          start: 'top top',
          end: '+=100%', // Reduceret fra 150% til 50% for kortere scroll i content-sektion
          scrub: 2,
          pin: true, // Tilbage til at pinne hele sektionen
          anticipatePin: 0.5,
          id: 'content-management-pin', // Tilføj ID så vi kan referere til det fra ImageViewer
        }
      });

      // Fase 1: Vis indholdet (0-40% af scrollet)
      contentTimeline.to({}, { duration: 0.4, ease: "expo.inOut" }); // Pause for at læse indholdet

      // Fase 2: Fade ud tekst og boxes (40-70% af scrollet)
      // FJERNET: Animation af contentTitle og contentDescription
      // contentTimeline.to([contentTitle.value, contentDescription.value], {
      //   opacity: 0,
      //   y: -30,
      //   duration: 0.15,
      // }, 0.4);

      // MIDLERTIDIGT DEAKTIVERET: FeatureBoxes animation
      // contentTimeline.to(featureBoxes.value, {
      //   opacity: 0,
      //   y: -30,
      //   duration: 0.15,
      //   ease: "expo.inOut",
      // }, 0.5);

      // Fase 3: Hold sektionen pinned resten af vejen (zoom-out håndteres i ImageViewer.vue)
      contentTimeline.to({}, { duration: 0.5, ease: "expo.inOut" }, 0.7);
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
            start: 'top 80%', // Starter senere - når toppen af sektionen nærmer sig viewport
            end: 'top -20%',  // Slutter senere - giver mere scroll-tid
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
            start: 'top 80%', // Starter senere - når toppen af sektionen nærmer sig viewport
            end: 'top -20%',  // Slutter senere - giver mere scroll-tid
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
          // Sæt initial state (CSS sætter også opacity: 0, men GSAP skal vide om transform)
          featureBoxes.forEach(box => {
            gsap.set([box.icon, box.title, box.description], {
              opacity: 0,
              y: 50
            });
          });

          // Opret ScrollTrigger for animation
          ScrollTrigger.create({
            trigger: featureBoxesSection,
            start: 'top 40%',
            onEnter: () => {
              // Animér hver feature box sekventielt (ikon, titel og beskrivelse sammen)
              const tl = gsap.timeline();
              featureBoxes.forEach((box, index) => {
                tl.to([box.icon, box.title, box.description], {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  ease: "power3.out"
                }, index * 0.15); // 0.15s delay mellem hver feature box
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
            start: 'top 80%', // Starter senere - når toppen af sektionen nærmer sig viewport
            end: 'top -20%',  // Slutter senere - giver mere scroll-tid
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

    // Clip-path animation for Quote video - animerer én gang når sektionen kommer ind i viewport
    if (quoteComponent.value && quoteComponent.value.quoteVideo) {
      const quoteVideoElement = quoteComponent.value.quoteVideo;
      const quoteSection = quoteVideoElement.closest('.quote-section');
      
      if (quoteSection && quoteVideoElement) {
        // Sæt initial state - videoen er fuldt clipped fra toppen (0% højde)
        gsap.set(quoteVideoElement, {
          clipPath: 'inset(100% 0% 0% 0%)'
        });

        // Opret ScrollTrigger der animerer én gang når sektionen kommer ind i viewport
        ScrollTrigger.create({
          trigger: quoteSection,
          start: 'top 80%',
          once: true, // Kør kun én gang
          onEnter: () => {
            // Animer clip-path fra 100% (fuldt clipped) til 0% (ingen clipping = 100% højde)
            gsap.to(quoteVideoElement, {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.5, // Langsom animation
              ease: 'power2.out' // Smooth easing
            });
          }
        });
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
            start: 'top 80%', // Starter tidligere - når toppen af sektionen nærmer sig viewport
            end: 'top -20%',  // Slutter senere - giver mere scroll-tid
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
            start: 'top 80%', // Starter tidligere - når toppen af sektionen nærmer sig viewport
            end: 'top -20%',  // Slutter senere - giver mere scroll-tid
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

// Opdel feature boxes header tekst i individuelle bogstaver
const featureBoxesHeaderString = 'Fuld webløsning – design, hosting og sikkerhed.';
const featureBoxesHeaderChars = featureBoxesHeaderString.split('');

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
      <p class="text-xs sm:text-sm font-medium tracking-wider uppercase text-white/70 m-0 group-hover:text-[rgb(255,100,255)] transition-colors">Scroll Ned</p>
      <div class="flex flex-col gap-1 items-center">
        <span class="scroll-line w-6 h-[0.1rem] bg-white/70 rounded-sm group-hover:bg-[rgb(255,100,255)] transition-colors" style="animation-delay: 0s"></span>
        <span class="scroll-line w-6 h-[0.1rem] bg-white/70 rounded-sm group-hover:bg-[rgb(255,100,255)] transition-colors" style="animation-delay: 0.15s"></span>
        <span class="scroll-line w-6 h-[0.1rem] bg-white/70 rounded-sm group-hover:bg-[rgb(255,100,255)] transition-colors" style="animation-delay: 0.3s"></span>
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
        :key="`viewer-${isMobile}`"
        :images="imageList" 
        :start-index="startIndex" 
        :visible="true"
        :video-src="isMobile ? null : 'https://flowmate.dk/wp-content/uploads/2025/05/flowmate-video-editor.mp4'"
        :blur-amount="viewerBlur"
        :brightness="viewerBrightness"
        :is-mobile="isMobile"
        @images-loaded="handleSpiralImagesLoaded"
        @update-blur="handleBlurUpdate"
      />
    </div>

    <!-- Vagt-element der markerer bunden/slutningen af scroll-zonen -->
    <div id="viewer-bottom-sentinel" style="height: 1px;"></div>

    <!-- Content Management sektion -->
    <section class="content-management-section">
      <div class="grid-container">
        <div class="content-management-wrapper">
          <div class="content-left">
            <p class="content-eyebrow text-xs sm:text-sm font-medium tracking-wider uppercase text-white/70 mb-0"></p>
            <h2 ref="contentTitle" class="content-title">
              <span class="content-title-line">Flowmate gør arbejdet med websites og</span>
              <span class="content-title-line">content management enkelt,hurtigt og helt</span>
              <span class="content-title-line">uden besvær. Vi tager os af det hele – design,</span>
              <span class="content-title-line">udvikling, hosting, compliance og sikkerhed –</span>
              <span class="content-title-line">så du kan fokusere på det sjove:</span>
              <span class="content-title-line">at skabe smukke og velfungerende websites</span>
              <span class="content-title-line">uden hovedpiner.</span>
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
    <section class="feature-boxes-section w-full min-h-screen relative bg-transparent pt-0 pb-24 flex items-center lg:pt-0 lg:pb-20 md:pt-0 md:pb-16 sm:pt-0 sm:pb-12 -mt-[40rem] lg:-mt-[30rem] md:-mt-[20rem] sm:-mt-[15rem] z-0">
      <div class="grid-container mt-48 lg:mt-80 md:mt-32 sm:mt-24">
        <div class="row-start-1 col-start-1 col-span-4 lg:col-start-1 lg:col-span-5 md:col-start-1 md:col-span-12 mb-16 lg:mb-0 md:mb-10">
          <p class="text-xs sm:text-sm font-medium tracking-wider uppercase text-white/70 mb-6">Features</p>
          <h2 ref="featureBoxesHeader" class="text-[4.5rem] lg:text-[3rem] md:text-[2.5rem] sm:text-[2rem] font-bold leading-[1.2] mb-0 text-white">
            <span v-for="(char, index) in featureBoxesHeaderChars" :key="index" :data-index="index" class="char-span">
              {{ char === ' ' ? '\u00A0' : char }}
            </span>
          </h2>
        </div>
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
    width: calc(100% - 5rem); /* 2.5rem på hver side */
    margin: -2rem 2.5rem 0;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .grid-container {
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
  display: grid;
  place-items: center;

}

.content-management-wrapper {
  display: contents; 
  
}

.content-management-section .grid-container {
  margin-top: -16rem;
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
 
  color: #fff;
 
  text-align: center;
  grid-row: 2;
  grid-column: 1 / 13; /* Spænder over kolonner 1-5 */
  display: flex;
  flex-direction: column;
  gap: 0;
}

.content-title-line {
  display: block;
}

/* Char span styling for scroll-baseret animation */
.char-span {
  display: inline-block;
  transition: color 0.1s ease-out;
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
    grid-column: 1 / 10;
  }

  .content-title {
    font-size: 2.5rem;
    grid-column: 1 / 10; /* Spænder over kolonner 1-9 */
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
    font-size: 2rem;
  }

  .content-management-section .feature-boxes-container {
    margin-top: 2rem;
  }
}

</style>