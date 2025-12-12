# FlowMate Animations Guide

This document serves as a comprehensive guide to the animation system implemented in the FlowMate website. The animations are built using GSAP (GreenSock Animation Platform) with ScrollTrigger and SplitText plugins.

## Table of Contents

1. [Animation Setup Overview](#animation-setup-overview)
2. [Animation Composable](#animation-composable)
3. [Types of Animations](#types-of-animations)
4. [Component Implementation](#component-implementation)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

## Animation Setup Overview

The animation system uses:
- GSAP core library
- ScrollTrigger plugin (for scroll-based animations)
- SplitText plugin (for text animations)

These are registered in the Nuxt plugin system for global availability.

### Key Files

- `app/plugins/gsap.client.ts`: GSAP plugin registration
- `app/composables/useGsapAnimations.ts`: Animation composable with reusable animation functions
- Various block components that implement the animations

## Animation Composable

The `useGsapAnimations` composable provides reusable animation functions that can be imported into any component.

### Available Animations

The composable includes several animation types:

1. **`fadeUp`**: Simple fade-in with upward movement
2. **`splitChars`**: Character-by-character animation (for large headings)
3. **`splitLines`**: Line-by-line animation (for paragraphs and small headings)
4. **`staggerAnimation`**: Animation applied to multiple elements in sequence
5. **`scrollTriggerAnimation`**: Applies ScrollTrigger to any animation

### Example Usage

```javascript
// Import the composable
import { useGsapAnimations } from "~/composables/useGsapAnimations";

// Inside your component setup/mounted
const { fadeUp, splitLines, splitChars, scrollTriggerAnimation } = useGsapAnimations();

// Access GSAP instances from Nuxt
const { $gsap, $gsapScrollTrigger, $gsapSplitText } = useNuxtApp();

// Create a timeline
const timeline = $gsap.timeline();

// Add animations to timeline
timeline.add(fadeUp(element, { delay: 0.2 }));

// Add scroll trigger
const trigger = scrollTriggerAnimation(
  sectionRef.value, 
  timeline, 
  { trigger: sectionRef.value, start: "top 80%" }
);
```

## Types of Animations

### Character Animations

Character animations split text into individual characters and animate them individually. Best for large headings (h1, h2).

```javascript
// Character animation for headings
const splitText = new $gsapSplitText(heading, { 
  type: "words,chars", 
  charsClass: "char-split",
  wordsClass: "word-split"
});

$gsap.fromTo(
  splitText.chars,
  { opacity: 0, y: 15, scale: 0.9 },
  { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)", stagger: 0.02 }
);
```

### Line Animations

Line animations split text into lines and animate them in sequence. Best for paragraphs and smaller headings (h3-h6).

```javascript
// Line animation for paragraphs
const splitText = new $gsapSplitText(paragraph, { type: "lines" });

$gsap.fromTo(
  splitText.lines,
  { opacity: 0, y: 20, rotationX: -45 },
  { opacity: 1, y: 0, rotationX: 0, duration: 0.8, ease: "power3.out", stagger: 0.05 }
);
```

### Staggered Element Animations

Staggered animations apply to a collection of elements in sequence. Great for lists, grids, or accordion items.

```javascript
// Staggered animation for grid items
$gsap.fromTo(
  elements,
  { opacity: 0, y: 30, scale: 0.95 },
  { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    duration: 0.6, 
    ease: "power2.out", 
    stagger: { 
      amount: 0.8,
      grid: [3, 3], // Grid layout (columns, rows)
      from: "start" 
    }
  }
);
```

## Component Implementation

Each block component follows a similar pattern for implementing animations:

### 1. Set Up References

```javascript
// Animation refs
const sectionRef = ref(null);
const contentRef = ref(null);
const headlineRef = ref(null);

// Store instances for cleanup
const scrollTriggerInstances = ref([]);
const splitTextInstances = ref([]);
const styleElements = ref([]);
```

### 2. Add CSS for Text Animations

Important CSS classes for character animation to preserve word boundaries:

```css
.word-split {
  display: inline-block;
  white-space: nowrap;
  margin-right: 0.1em;
}
.char-split {
  display: inline-block;
  position: relative;
}
```

### 3. Animation Setup in onMounted

```javascript
onMounted(() => {
  if (!sectionRef.value) return;
  
  // Get GSAP instances
  const { $gsap, $gsapScrollTrigger, $gsapSplitText } = useNuxtApp();
  const { fadeUp, scrollTriggerAnimation } = useGsapAnimations();
  
  // Create a timeline
  const timeline = $gsap.timeline();
  
  // Add animations to timeline
  
  // Apply scroll trigger
  const trigger = scrollTriggerAnimation(sectionRef.value, timeline, scrollConfig);
  if (trigger) scrollTriggerInstances.value.push(trigger);
});
```

### 4. Proper Cleanup in onBeforeUnmount

```javascript
onBeforeUnmount(() => {
  // Kill all ScrollTrigger instances
  scrollTriggerInstances.value.forEach(trigger => {
    if (trigger && trigger.kill) trigger.kill();
  });
  
  // Revert all SplitText instances
  splitTextInstances.value.forEach(splitText => {
    if (splitText && splitText.revert) splitText.revert();
  });
  
  // Remove any dynamically created style elements
  styleElements.value.forEach(style => {
    if (style && style.parentNode) {
      style.parentNode.removeChild(style);
    }
  });
});
```

## Block-Specific Implementation Details

### TextBlock

- Character-by-character animation for large headings
- Line-by-line animation for small headings and paragraphs
- Simple fade-up for buttons

### AccordionBlock

- Text animations for headings
- Staggered fade-in for accordion items
- `clearProps: "all"` to avoid conflicts with accordion functionality

### ArchiveBlock

- Grid-based staggered animations
- Animation initialization after data loads

### GalleryBlock

- Text animations for headings
- Staggered animations for gallery images with scale effect

### HeroBlock

- Character animations for main headings
- Line animations for text content
- Initial delay for page load experience

### ImageBlock

- Simple fade-in with scale animation

### QuoteBlock

- Special character animation with rotationY effect for quote text
- Simple fade-up for attribution text

## Best Practices

1. **Always Clean Up Animations**: Use `onBeforeUnmount` to clean up all animation instances.

2. **Handle Word Splitting Correctly**: Use `"words,chars"` for character animations to preserve word boundaries.

3. **Use Timeline for Complex Sequences**: Create GSAP timelines for complex animation sequences.

4. **Appropriate Animation Types**: 
   - Character animations for large headings
   - Line animations for paragraphs and small headings
   - Simple fade animations for images and other elements

5. **Performance Considerations**:
   - Use `will-change` CSS property for performance on complex animations
   - Consider disabling animations on mobile or reducing complexity

6. **Error Handling**: Always wrap animation code in try/catch blocks.

## Troubleshooting

### Text Splitting Issues

If text is breaking awkwardly during character animations, ensure:
- You're using `"words,chars"` split type instead of just `"chars"`
- You've added the proper CSS for `.word-split` and `.char-split`

### Animations Not Firing

Check that:
- ScrollTrigger is configured correctly
- Elements have the correct references
- Your timeline is properly created and has animations added
- The trigger element is properly sized and visible

### Memory Leaks

Ensure proper cleanup:
- Kill all ScrollTrigger instances
- Revert all SplitText instances
- Remove any dynamically created style elements

---

## Quick Reference

### Animation Config Objects

```javascript
// Animation configurations for reuse
const animationConfigs = {
  splitLines: {
    from: { opacity: 0, y: 20, rotationX: -45 },
    to: { opacity: 1, y: 0, rotationX: 0, duration: 0.8, ease: "power3.out", stagger: 0.05 }
  },
  splitChars: {
    from: { opacity: 0, y: 15, scale: 0.9 },
    to: { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)", stagger: 0.02 }
  }
};
```

### Common ScrollTrigger Config

```javascript
// Standard scroll configuration
const scrollConfig = {
  trigger: sectionRef.value,
  start: "top 80%", // Start when top of element reaches 80% from top of viewport
  end: "bottom 20%",
  toggleActions: "play none none none", // Play on enter, do nothing else
};
```

### Helper Functions

```javascript
// Helper function to find heading elements
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
``` 