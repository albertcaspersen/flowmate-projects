import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

/**
 * Animation configuration interface
 */
interface AnimationConfig {
  duration?: number;
  ease?: string;
  delay?: number;
  y?: number;
  opacity?: number;
  scale?: number;
  rotation?: number;
  stagger?: number;
  x?: number;
  skewX?: number;
  skewY?: number;
  transformOrigin?: string;
  color?: string;
}

/**
 * ScrollTrigger configuration interface
 */
interface ScrollTriggerConfig {
  trigger: Element | string;
  start?: string;
  end?: string;
  toggleActions?: string;
  scrub?: boolean | number;
  markers?: boolean;
}

/**
 * Default animation configurations
 */
const defaultConfigs = {
  fadeUp: {
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
  },
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1, duration: 0.6, ease: "power2.out" }
  },
  splitLines: {
    from: { opacity: 0, y: 20, rotationX: -45 },
    to: { opacity: 1, y: 0, rotationX: 0, duration: 0.8, ease: "power3.out", stagger: 0.05 }
  },
  splitChars: {
    from: { opacity: 0, y: 15, scale: 0.9 },
    to: { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)", stagger: 0.02 }
  }
  // Add more presets as needed
};

/**
 * Animation type enum
 */
type AnimationType = 
  | 'fadeUp'
  | 'fadeIn'
  | 'splitLines'
  | 'splitChars'
  | 'scaleIn'
  | 'slideIn'
  // Add more animation types

/**
 * Composable for GSAP animations
 */
export const useGsapAnimations = () => {
  const { $gsap, $gsapTimeline, $gsapScrollTrigger } = useNuxtApp();

  // Type assertions for GSAP plugins
  const gsapInstance = $gsap as typeof gsap;
  const scrollTriggerInstance = $gsapScrollTrigger as typeof ScrollTrigger;
  const timelineInstance = $gsapTimeline as gsap.core.Timeline;

  // Register SplitText plugin
  if (typeof window !== 'undefined' && gsapInstance) {
    gsapInstance.registerPlugin(SplitText);
  }

  /**
   * Create a staggered animation for multiple elements
   */
  const staggerAnimation = (
    elements: Element[] | string[],
    config: AnimationConfig = {},
    staggerAmount: number = 0.1
  ) => {
    return gsapInstance.fromTo(
      elements,
      {
        opacity: 0,
        y: 20,
        ...config
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: staggerAmount,
        ...config
      }
    );
  };

  /**
   * Create a scroll-triggered animation
   */
  const scrollTriggerAnimation = (
    element: Element | string,
    animation: gsap.core.Timeline | gsap.core.Tween,
    scrollConfig: ScrollTriggerConfig
  ) => {
    // Ensure we don't interfere with native scrolling
    const safeConfig = {
      ...scrollConfig,
      animation,
      preventOverlaps: true,
      fastScrollEnd: true,
      overwrite: 'auto',
      // Make sure animations only play on enter, not on exit
      toggleActions: scrollConfig.toggleActions || "play none none none",
      autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load' // Don't refresh on resize
    };
    
    return scrollTriggerInstance.create(safeConfig);
  };

  /**
   * Create a fade-up animation
   */
  const fadeUp = (
    element: Element | string,
    config: AnimationConfig = {}
  ) => {
    return gsapInstance.fromTo(
      element,
      { ...defaultConfigs.fadeUp.from, ...config },
      { ...defaultConfigs.fadeUp.to, ...config }
    );
  };

  /**
   * Split text into lines and animate each line
   */
  const splitLines = (
    element: Element | string,
    config: AnimationConfig = {}
  ) => {
    // Ensure we have a DOM element
    if (!element) return null;
    
    try {
      // Create a timeline for the animation
      const timeline = gsapInstance.timeline();
      
      // Use SplitText to split the text into lines
      const splitText = new (gsapInstance as any).SplitText(element, { type: "lines" });
      
      // Animate each line with a stagger effect
      timeline.fromTo(
        splitText.lines,
        { ...defaultConfigs.splitLines.from, ...config },
        { ...defaultConfigs.splitLines.to, ...config }
      );
      
      return timeline;
    } catch (error) {
      console.error("Error in splitLines animation:", error);
      return null;
    }
  };

  /**
   * Split text into characters and animate each character
   */
  const splitChars = (
    element: Element | string,
    config: AnimationConfig = {}
  ) => {
    // Ensure we have a DOM element
    if (!element) return null;
    
    try {
      // Create a timeline for the animation
      const timeline = gsapInstance.timeline();
      
      // Use SplitText to split the text into both words and characters
      // This preserves word boundaries while still allowing character animation
      const splitText = new (gsapInstance as any).SplitText(element, { 
        type: "words,chars",
        charsClass: "char-split",
        wordsClass: "word-split"
      });
      
      // Add inline styles to prevent unwanted line breaks on character spans
      if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.textContent = `
          .word-split {
            display: inline-block;
            white-space: nowrap;
            margin-right: 0.1em; /* Small spacing between words */
          }
          .char-split {
            display: inline-block; 
            position: relative;
          }
        `;
        document.head.appendChild(style);
        
        // Add a cleanup function to the timeline
        timeline.eventCallback("onComplete", () => {
          // Optional: Remove the style element when animation completes
          // document.head.removeChild(style);
        });
      }
      
      // Animate each character with a stagger effect
      timeline.fromTo(
        splitText.chars,
        { ...defaultConfigs.splitChars.from, ...config },
        { ...defaultConfigs.splitChars.to, ...config }
      );
      
      return timeline;
    } catch (error) {
      console.error("Error in splitChars animation:", error);
      return null;
    }
  };

  // Add more animation functions as needed

  /**
   * Create a sequence of animations
   */
  const sequence = (
    elements: Element[] | string[],
    animationType: AnimationType = 'fadeUp',
    config: { staggerAmount?: number; duration?: number; ease?: string; delay?: number } = {}
  ) => {
    const timeline = gsapInstance.timeline();
    // Implementation details
    return timeline;
  };

  return {
    staggerAnimation,
    scrollTriggerAnimation,
    fadeUp,
    splitLines,
    splitChars,
    sequence,
    // Return other animation functions
  };
};