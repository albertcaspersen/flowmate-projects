import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

export default defineNuxtPlugin(() => {
  // Register plugins
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Create a global timeline that can be accessed across components
  const gsapTimeline = gsap.timeline({ paused: true });

  return {
    provide: {
      gsap,
      gsapScrollTrigger: ScrollTrigger,
      gsapSplitText: SplitText,
      gsapTimeline,
    },
  };
});