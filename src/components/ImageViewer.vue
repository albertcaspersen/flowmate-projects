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

// Refs
const viewerOverlay = ref(null);
const threeContainer = ref(null);

// Three.js variabler
let scene, camera, renderer, animationFrameId;
let spiralGroup; // <-- NYT: Gruppe til at holde alle billeder
const loadedMeshes = []; // Til oprydning
let lastFrameTime = 0;
const mobileTargetFPS = 30; // Reducer FPS på mobil
const mobileFrameInterval = 1000 / mobileTargetFPS;

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
    });
  });

  // Tilføj video som det sidste element på spiralen, hvis der er en video
  if (props.videoSrc) {
    createVideoPlane();
  }
}

//
// -------- OPRETTER VIDEO-PLAN PÅ SPIRALEN --------
//
function createVideoPlane() {
  const video = document.createElement('video');
  video.src = props.videoSrc;
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = 'anonymous';
  
  // Vent til videoen har indlæst metadata, så vi kan få dens aspekt ratio
  video.addEventListener('loadedmetadata', () => {
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
  });

  // Start afspilning
  video.play().catch(err => console.log('Video autoplay fejl:', err));
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
      z: 95, // Zoom ind fra 120 til 95 (kun desktop)
      ease: "power2.inOut", // Blød start og blød afslutning på zoom
      duration: 0.35, // 35% af tidslinjen
    }, "-=0.05"); // Start 5% før forrige animation slutter for blødere overgang
  } else {
    // På mobil: lav zoom da billederne allerede er tættere på
    tl.to(camera.position, {
      z: 65, // Zoom ind fra 75 til 65 (mindre zoom på mobil)
      ease: "power2.inOut",
      duration: 0.35,
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

  ScrollTrigger.getAll().forEach(t => t.kill());

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
  height: 100%;
}
</style>