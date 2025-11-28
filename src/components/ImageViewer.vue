<template>
  <div ref="viewerOverlay" class="image-viewer-overlay">
    <!-- Three.js scene -->
    <div 
      ref="threeContainer" 
      class="three-container"
      :style="{ filter: `blur(${props.blurAmount}px) brightness(${props.brightness})` }"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Props
const props = defineProps({
  images: { type: Array, required: true },
  videoSrc: { type: String, default: null },
  blurAmount: { type: Number, default: 0 },
  brightness: { type: Number, default: 1 },
  isMobile: { type: Boolean, default: false },
});

// Emits
const emit = defineEmits(['images-loaded', 'update-blur']);

// Refs
const viewerOverlay = ref(null);
const threeContainer = ref(null);

// Loading state
let loadedTexturesCount = 0;
let totalTexturesToLoad = 0;

// Three.js variabler
let scene, camera, renderer, animationFrameId;
let spiralGroup; // <-- NYT: Gruppe til at holde alle billeder
const loadedMeshes = []; // Til oprydning
let lastFrameTime = 0;
const mobileTargetFPS = 30; // Reducer FPS på mobil
const mobileFrameInterval = 1000 / mobileTargetFPS;

// Idle-animation variabler
let idleAnimationId = null;
let scrollTimeout = null;
let fadeOutAnimationId = null;

// Bølge-højde kontrol (juster denne værdi for at ændre bølgehøjden)
const waveAmplitude = ref(7); // Standard værdi: 8. Øg for højere bølger, sænk for lavere bølger

// Eksponér kameraet og video globalt så App.vue kan animere det
if (typeof window !== 'undefined') {
  window.flowmateCamera = null;
  window.flowmateCameraInitialZ = null;
  window.flowmateVideo = null;
}

//
// -------- THREE.JS SETUP --------
//
function initThree() {
  // 1. Scene
  scene = new THREE.Scene();

  // 2. Kamera
  const fov = 75;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 1000;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  // Zoom kameraet tættere på mobil så billederne ser større ud
  camera.position.z = props.isMobile ? 75 : 120;
  // Sørg for at kameraet starter højt oppe, så første billede ikke ses i hero
  camera.position.y = 175; // Højere værdi = kameraet starter højere op
  camera.lookAt(0, 0, 0);

  // Eksponér kameraet globalt
  if (typeof window !== 'undefined') {
    window.flowmateCamera = camera;
    window.flowmateCameraInitialZ = camera.position.z;
  }


  // 3. Renderer
  // Reducer kvalitet på mobil for bedre performance
  renderer = new THREE.WebGLRenderer({ 
    antialias: !props.isMobile, // Slå antialiasing fra på mobil
    alpha: true,
    powerPreference: props.isMobile ? 'low-power' : 'high-performance',
    // Ekstra mobil-optimeringer
    ...(props.isMobile && {
      precision: 'lowp', // Lav præcision på mobil
      logarithmicDepthBuffer: false,
    })
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Reducer pixelRatio på mobil for bedre performance
  renderer.setPixelRatio(props.isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
  // Sæt korrekt farverum for at bevare originale farver
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  threeContainer.value.appendChild(renderer.domElement);

  // Tilføj billeder til scenen
  createImageSpiral();

  // Start animationsloop
  animate();

  // Opsæt scroll-animation
  setupScrollAnimation();

  // SIMPEL ZOOM-OUT ANIMATION - trigger fra content management sektion
  setTimeout(() => {
    
    // --- ANIMATION 1: ZOOM-UD OG BLUR UNDER CONTENT MANAGEMENT SEKTION ---
    const contentSection = document.querySelector('.content-management-section');
    if (contentSection && camera) {
      const initialZ = props.isMobile ? 75 : 120; // Kameraets start-zoom
      
      ScrollTrigger.create({
        trigger: contentSection,
        start: 'top bottom', // Start blur når content-sektionen når bunden af vinduet (før den bliver synlig)
        end: '+=150%', // Øget til 150% så blur-effekten varer længere ind i content-sektionen
        scrub: 1,
        onUpdate: (self) => {
          // Opdater blur og brightness baseret på scroll-progression
          // Blur starter gradvist efter video-zoom og holder maksimum når content-sektionen bliver synlig
          if (self.progress < 0.20) {
            // Første 20%: ingen blur (pause efter video-zoom)
            emit('update-blur', { blur: 0, brightness: 1 });
          } else if (self.progress < 0.50) {
            // 20-50%: blur stiger gradvist
            const blurProgress = (self.progress - 0.20) / 0.30;
            const blur = blurProgress * 8;
            const brightness = 1 - (blurProgress * 0.5);
            emit('update-blur', { blur, brightness });
          } else {
            // 50-100%: hold blur på maksimum niveau
            emit('update-blur', { blur: 8, brightness: 0.5 });
          }
          
          // Håndter kameraets zoom-ud i slutningen af animationen
          // Zoom kun ud hvis vi ikke allerede har zoomet ind på videoen
          if (self.progress >= 0.8 && !hasZoomedInOnVideo) {
            const zoomProgress = (self.progress - 0.7) / 0.3;
            const currentZ = camera.position.z;

            if (!self.zoomStartZ && zoomProgress > 0) {
              self.zoomStartZ = currentZ;
            }

            if (self.zoomStartZ) {
              const initialZ = props.isMobile ? 75 : 120;
              const easedProgress = 1 - Math.pow(1 - zoomProgress, 3);
              camera.position.z = self.zoomStartZ + (initialZ - self.zoomStartZ) * easedProgress;
            }
          }
        },
        id: 'content-zoom-out'
      });
    }

    // --- ANIMATION 2: FADE OUT OVERLAY HEIGHT EFTER CONTENT SEKTION ---
    const nextSection = document.querySelector('.next-section');
    if (nextSection) {
      // Variabler til idle-animation
      let lastScrollProgress = 0;
      let scrollDirection = 1; // 1 = ned (højre), -1 = op (venstre)
      let idleWaveOffset = 0;
      let isIdleAnimating = false;
      let fadeOutStartTime = null;
      let fadeOutStartOffset = 0; // Gem start-værdien for fade-out
      let fadeOutDuration = 300; // 300ms fade-out periode (øget for blødere stop)

      // Funktion til at opdatere clip-path med idle-animation
      const updateClipPath = (heightProgress, waveOffset = 0) => {
        const newHeight = (1 - heightProgress) * 100;
        viewerOverlay.value.style.height = `${newHeight}vh`;

        // Kombiner scroll-baseret waveOffset med idle-animation offset
        const totalWaveOffset = heightProgress * 16 + waveOffset;
        const baseY = 100 - heightProgress * 100;

        const points = [];
        points.push('0% 0%', '100% 0%');

        const numPoints = 30;
        for (let i = 0; i <= numPoints; i++) {
          const xPercent = 100 - (i / numPoints) * 100;
          const waveX = (i / numPoints) * Math.PI * 2 + totalWaveOffset;
          const waveY = baseY + Math.sin(waveX) * waveAmplitude.value;
          points.push(`${xPercent}% ${waveY}%`);
        }

        viewerOverlay.value.style.clipPath = `polygon(${points.join(', ')})`;
      };

      // Funktion til idle-animation (skvulpe-effekt)
      const startIdleAnimation = (targetProgress) => {
        if (isIdleAnimating) return;
        isIdleAnimating = true;
        
        let startTime = performance.now();
        const duration = 2000; // 2 sekunder for en komplet skvulpe-cyklus
        const maxOffset = 8; // Maksimal offset for skvulpe-effekten (øget for mere skvulpe)

        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = elapsed / duration;
          
          // Brug en easing funktion der går i én retning og gradvist stopper
          // Ease-out funktion der starter hurtigt og gradvist stopper
          const damping = Math.exp(-progress * 2); // Eksponentiel dæmpning
          const startEase = Math.min(progress * 3, 1); // Gradvist byg op i første tredjedel
          
          // Brug en ease-out kurve der går fra 0 til 1 og så tilbage til 0
          // Men kun i én retning baseret på scroll-retningen
          const easeOut = 1 - Math.pow(1 - Math.min(progress, 1), 3);
          const easeInOut = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          
          // Skvulpe i én retning baseret på scroll-retningen
          // scrollDirection = 1 (ned) -> positiv offset (højre)
          // scrollDirection = -1 (op) -> negativ offset (venstre)
          idleWaveOffset = easeInOut * maxOffset * damping * startEase * scrollDirection;
          
          // Opdater clip-path med idle-animation
          updateClipPath(targetProgress, idleWaveOffset);
          
          // Stop animationen når den er dæmpet nok - men start fade-out i stedet for pludselig stop
          if (damping < 0.05) {
            isIdleAnimating = false;
            // Start fade-out i stedet for at sætte til 0 med det samme
            if (idleWaveOffset !== 0 && fadeOutStartTime === null) {
              fadeOutStartTime = performance.now();
              fadeOutStartOffset = idleWaveOffset;
            }
            return;
          }
          
          idleAnimationId = requestAnimationFrame(animate);
        };
        
        idleAnimationId = requestAnimationFrame(animate);
      };

      // Funktion til at stoppe idle-animation med blød fade-out
      const stopIdleAnimation = () => {
        if (idleAnimationId) {
          cancelAnimationFrame(idleAnimationId);
          idleAnimationId = null;
        }
        isIdleAnimating = false;
        // Start fade-out i stedet for at sætte til 0 med det samme
        if (idleWaveOffset !== 0 && fadeOutStartTime === null) {
          fadeOutStartTime = performance.now();
          fadeOutStartOffset = idleWaveOffset;
          startFadeOutAnimation();
        } else if (idleWaveOffset === 0) {
          fadeOutStartTime = null;
          if (fadeOutAnimationId) {
            cancelAnimationFrame(fadeOutAnimationId);
            fadeOutAnimationId = null;
          }
        }
      };

      // Funktion til at håndtere fade-out animation kontinuerligt
      const startFadeOutAnimation = () => {
        if (fadeOutAnimationId) return; // Allerede kører
        
        const fadeOutLoop = () => {
          if (fadeOutStartTime === null) {
            fadeOutAnimationId = null;
            return;
          }
          
          const fadeOutElapsed = performance.now() - fadeOutStartTime;
          const fadeOutProgress = Math.min(fadeOutElapsed / fadeOutDuration, 1);
          // Ease-out for blødere fade
          const easeOut = 1 - Math.pow(1 - fadeOutProgress, 3);
          idleWaveOffset = fadeOutStartOffset * (1 - easeOut);
          
          // Opdater clip-path med fade-out offset
          updateClipPath(lastScrollProgress, idleWaveOffset);
          
          if (fadeOutProgress >= 1) {
            idleWaveOffset = 0;
            fadeOutStartTime = null;
            fadeOutStartOffset = 0;
            fadeOutAnimationId = null;
            updateClipPath(lastScrollProgress, 0);
            return;
          }
          
          fadeOutAnimationId = requestAnimationFrame(fadeOutLoop);
        };
        
        fadeOutAnimationId = requestAnimationFrame(fadeOutLoop);
      };

      ScrollTrigger.create({
        trigger: nextSection,
        start: 'top bottom',
        end: 'top top',
        scrub: 1,
        onUpdate: (self) => {
          // Stop idle-animation når man scroller
          stopIdleAnimation();
          
          const heightProgress = self.progress;
          // Detekter scroll-retning baseret på om progress stiger eller falder
          if (heightProgress > lastScrollProgress) {
            scrollDirection = 1; // Scroller ned -> højre
          } else if (heightProgress < lastScrollProgress) {
            scrollDirection = -1; // Scroller op -> venstre
          }
          lastScrollProgress = heightProgress;
          
          // Opdater clip-path med nuværende idle offset (fade-out håndteres i fade-out loop)
          updateClipPath(heightProgress, idleWaveOffset);

          // Tilføj blur effekt til content section elementer
          const blurAmount = heightProgress * 10;
          const contentTitle = document.querySelector('.content-title');
          const contentDescription = document.querySelector('.content-description');
          const featureContents = document.querySelectorAll('.feature-content');

          if (contentTitle) {
            contentTitle.style.filter = `blur(${blurAmount}px)`;
          }
          if (contentDescription) {
            contentDescription.style.filter = `blur(${blurAmount}px)`;
          }
          featureContents.forEach((featureContent) => {
            featureContent.style.filter = `blur(${blurAmount}px)`;
          });

          // Clear tidligere timeout
          if (scrollTimeout) {
            clearTimeout(scrollTimeout);
          }

          // Start idle-animation efter kort settle-periode for at undgå jitter
          scrollTimeout = setTimeout(() => {
            startIdleAnimation(heightProgress);
          }, 1);
        },
        onLeaveBack: () => {
          // Stop idle-animation
          stopIdleAnimation();
          // Stop fade-out animation
          if (fadeOutAnimationId) {
            cancelAnimationFrame(fadeOutAnimationId);
            fadeOutAnimationId = null;
          }
          fadeOutStartTime = null;
          fadeOutStartOffset = 0;
          idleWaveOffset = 0;
          
          if (scrollTimeout) {
            clearTimeout(scrollTimeout);
          }

          // Genopret fuld height når man scroller tilbage
          viewerOverlay.value.style.height = '100vh';

          // Genopret lige kant når man scroller tilbage
          viewerOverlay.value.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';

          // Fjern blur effekt når man scroller tilbage
          const contentTitle = document.querySelector('.content-title');
          const contentDescription = document.querySelector('.content-description');
          const featureContents = document.querySelectorAll('.feature-content');

          if (contentTitle) {
            contentTitle.style.filter = 'blur(0px)';
          }
          if (contentDescription) {
            contentDescription.style.filter = 'blur(0px)';
          }
          featureContents.forEach((featureContent) => {
            featureContent.style.filter = 'blur(0px)';
          });
        },
        id: 'overlay-fade-out',
        ease: "power3.inOut",
      });
    }


  }, 500); // 500ms forsinkelse

  // Håndter vindues-resize
  window.addEventListener('resize', onWindowResize);
}

//
// -------- OPRETTER BILLED-SPIRALEN --------
//
function createImageSpiral() {
  const textureLoader = new THREE.TextureLoader();
  spiralGroup = new THREE.Group(); // <-- NYT: Opret gruppen
  scene.add(spiralGroup);          // <-- NYT: Tilføj gruppen til scenen
  
  // Sæt spiralens start-rotation (juster dette tal for at dreje spiralen)
  spiralGroup.rotation.y = -Math.PI * 1.4; // 0.25 = 45 grader, 0.5 = 90 grader, osv.

  // Parametre for spiralen
  // Reducer størrelse på mobil for bedre performance
  const radius = props.isMobile ? 60 : 80;
  const verticalSpacing = 40;
  const angleStep = 0.7;

  // Beregn hvor mange teksturer vi skal loade
  totalTexturesToLoad = props.images.length + (props.videoSrc ? 1 : 0);
  
  // Funktion til at tjekke om alle teksturer er loadet
  const checkAllTexturesLoaded = () => {
    loadedTexturesCount++;
    if (loadedTexturesCount === totalTexturesToLoad) {
      emit('images-loaded');
    }
  };

  props.images.forEach((image, index) => {
    textureLoader.load(image.src, (texture) => {
      // Sæt korrekt farverum for teksturen
      texture.colorSpace = THREE.SRGBColorSpace;
      
      // Mobil texture optimering
      if (props.isMobile) {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
      }
      
      const imageAspect = texture.image.width / texture.image.height;
      // Justeret plane størrelse på mobil for optimal visning
      const planeWidth = props.isMobile ? 45 : 50;
      const planeHeight = planeWidth / imageAspect;
      
      const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
      const material = new THREE.MeshBasicMaterial({ 
        map: texture, 
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geometry, material);

      const angle = index * angleStep;
      const y = -index * verticalSpacing;
      
      mesh.position.set(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );
      
      mesh.lookAt(new THREE.Vector3(0, y, 0));
      
      // Spejlvend billedet horisontalt
      mesh.scale.x = -1;

      spiralGroup.add(mesh); // <-- ÆNDRING: Tilføj mesh til gruppen, ikke scenen
      loadedMeshes.push(mesh);
      
      // Tjek om alle teksturer er loadet
      checkAllTexturesLoaded();
    });
  });

  // Tilføj video som det sidste element på spiralen, hvis der er en video
  if (props.videoSrc) {
    createVideoPlane(checkAllTexturesLoaded);
  }
}

//
// -------- OPRETTER VIDEO-PLAN PÅ SPIRALEN --------
//
let videoElement = null; // Gem reference til video elementet

function createVideoPlane(onVideoLoaded) {
  const video = document.createElement('video');
  video.src = props.videoSrc;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = 'anonymous';
  
  // Gem reference til video elementet så vi kan kontrollere det senere
  videoElement = video;
  
  // Eksponér video globalt
  if (typeof window !== 'undefined') {
    window.flowmateVideo = video;
  }
  
  // Vent til videoen har indlæst metadata, så vi kan få dens aspekt ratio
  video.addEventListener('loadedmetadata', () => {
    // Tving videoen til at spille hele tiden, upåvirket af scroll
    video.play().catch(err => console.log('Video play fejl:', err));
    
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;

    const videoAspect = video.videoWidth / video.videoHeight;
    // Justeret video plane størrelse (kun relevant for desktop da mobil ikke viser video)
    const planeWidth = props.isMobile ? 45 : 50;
    const planeHeight = planeWidth / videoAspect;

    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    const material = new THREE.MeshBasicMaterial({
      map: videoTexture,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);

    // Parametre for spiralen (samme som for billeder)
    // Reducer størrelse på mobil for bedre performance
    const radius = props.isMobile ? 60 : 80;
    const verticalSpacing = 40;
    const angleStep = 0.7;

    // Placer videoen efter det sidste billede
    const index = props.images.length; // Dette vil være position efter sidste billede
    const angle = index * angleStep;
    const y = -index * verticalSpacing;

    mesh.position.set(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius
    );

    mesh.lookAt(new THREE.Vector3(0, y, 0));

    // Spejlvend billedet horisontalt
    mesh.scale.x = -1;

    spiralGroup.add(mesh);
    loadedMeshes.push(mesh);
    
    // Kald callback for at signalere at video er loadet
    if (onVideoLoaded) {
      onVideoLoaded();
    }
  });
}

//
// -------- SCROLL-ANIMATION MED GSAP --------
//
function setupScrollAnimation() {
  // Find viewer-wrapper elementet fra App.vue
  const viewerWrapper = document.querySelector('.viewer-wrapper');
  
  if (!viewerWrapper) {
    console.error('viewer-wrapper ikke fundet!');
    return;
  }

  // Beregn det samlede antal elementer på spiralen (billeder + video)
  const totalElements = props.images.length + (props.videoSrc ? 1 : 0);

  // Video spiller automatisk hele tiden via autoplay
  let hasZoomedInOnVideo = false; // Track om vi har zoomet ind på videoen
  const initialCameraZ = props.isMobile ? 75 : 120;

  // Opret en GSAP Timeline, der er koblet til scroll-positionen
  const tl = gsap.timeline({
    ease: "none",
    scrollTrigger: {
      trigger: viewerWrapper,
      start: "top top%", // Start når toppen af viewer-wrapper rammer toppen af vinduet
      end: "bottom bottom", // Slut når bunden af viewer-wrapper rammer bunden af vinduet
      scrub: props.isMobile ? 0.5 : 1, // Lavere værdi på mobil for bedre performance
      onUpdate: (self) => {
        // Fjern fade-out så spiralen forbliver synlig
        viewerOverlay.value.style.opacity = 1;
        
        // Ingen blur i viewer-wrapper - alt blur håndteres i content section
        emit('update-blur', { blur: 0, brightness: 1 });
        
        // Video spiller allerede hele tiden via autoplay, ingen manuel start nødvendig
      }
    }
  });

  // Føj rotation af hele spiralen til tidslinjen (65% af animationen)
  tl.to(spiralGroup.rotation, {
    y: Math.PI * 1.505, // Positivt tal = roterer med uret når du scroller ned. Juster for mere/mindre rotation.
    ease: "power1.out", // Blødere afslutning på rotationen
    duration: 0.65, // 65% af tidslinjen
  });

  // Føj bevægelse af kameraet nedad til tidslinjen (starter samtidig, 65% af animationen)
  tl.to(camera.position, {
    y: -(totalElements - 1) * 40, // Bevæg kameraet ned til bunden af spiralen inkl. video
    ease: "power1.out", // Blødere afslutning på bevægelsen
    duration: 0.65, // 65% af tidslinjen
  }, "<"); // "<" betyder start samtidig med forrige animation

  // Zoom ind på videoen i de sidste 35% af scrollet med overlap
  // På mobil zoomer vi kun lidt da der ingen video er
  if (!props.isMobile) {
    tl.to(camera.position, {
      z: 98, // Zoom ind fra 120 til 95 (kun desktop)
      ease: "power2.inOut", // Blød start og blød afslutning på zoom
      duration: 0.35, // 35% af tidslinjen
      onComplete: () => { hasZoomedInOnVideo = true; } // Marker at vi har zoomet ind på videoen
    }, "-=0.05"); // Start 5% før forrige animation slutter for blødere overgang
  } else {
    // På mobil: lav zoom da billederne allerede er tættere på
    tl.to(camera.position, {
      z: 65, // Zoom ind fra 75 til 65 (mindre zoom på mobil)
      ease: "power2.inOut",
      duration: 0.35,
      onComplete: () => { hasZoomedInOnVideo = true; } // Marker at vi har zoomet ind på videoen
    }, "-=0.05");
  }
}


//
// -------- ANIMATIONSLOOP OG RESIZE HANDLER --------
//
function animate(currentTime = 0) {
  animationFrameId = requestAnimationFrame(animate);
  
  // Throttle FPS på mobil for bedre performance
  if (props.isMobile) {
    const deltaTime = currentTime - lastFrameTime;
    if (deltaTime < mobileFrameInterval) {
      return; // Skip denne frame
    }
    lastFrameTime = currentTime - (deltaTime % mobileFrameInterval);
  }
  
  // Opdater kameraet til altid at kigge mod midten på sin nuværende højde
  // Dette giver en mere stabil oplevelse, når både kamera bevæger sig og spiralen roterer
  if (spiralGroup) {
      camera.lookAt(new THREE.Vector3(0, camera.position.y, 0));
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  // Bevar den samme pixelRatio logik som ved initialisering
  renderer.setPixelRatio(props.isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
}



//
// -------- LIFECYCLE HOOKS --------
//
onMounted(() => {
  // Initialiser Three.js
  if (threeContainer.value) {
      initThree();
  }
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);

  // Ryd op idle-animation hvis den kører
  if (idleAnimationId) {
    cancelAnimationFrame(idleAnimationId);
    idleAnimationId = null;
  }
  // Ryd op fade-out animation hvis den kører
  if (fadeOutAnimationId) {
    cancelAnimationFrame(fadeOutAnimationId);
    fadeOutAnimationId = null;
  }
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
    scrollTimeout = null;
  }

  ScrollTrigger.getAll().forEach(t => t.kill());

  // Ryd op globale references
  if (typeof window !== 'undefined') {
    window.flowmateCamera = null;
    window.flowmateCameraInitialZ = null;
    window.flowmateVideo = null;
  }

  // Stop og ryd op video element
  if (videoElement) {
    videoElement.pause();
    videoElement.src = '';
    videoElement = null;
  }

  if (spiralGroup) { // <-- NYT: Tjek om gruppen eksisterer
    loadedMeshes.forEach(mesh => {
      mesh.geometry.dispose();
      mesh.material.map?.dispose();
      mesh.material.dispose();
      spiralGroup.remove(mesh); // <-- ÆNDRING: Fjern fra gruppen
    });
    scene.remove(spiralGroup); // <-- NYT: Fjern gruppen fra scenen
  }
  
  if (renderer) {
      renderer.dispose();
  }
  
  window.removeEventListener('resize', onWindowResize);
  
  if (threeContainer.value && renderer?.domElement) {
    threeContainer.value.removeChild(renderer.domElement);
  }
});

</script>

<style scoped>
.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: rgba(255, 0, 0, 0);
  opacity: 1;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.image-viewer-overlay > * {
  pointer-events: auto;
}

.three-container {
  width: 100%;
  height: 90%;
 
}
</style>