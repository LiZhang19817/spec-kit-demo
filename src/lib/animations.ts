/**
 * GSAP animation helpers
 * Reusable animation utilities using GSAP
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/**
 * Apple-style easing curves
 */
export const EASINGS = {
  // Standard easing for most animations
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',

  // Deceleration easing for entering elements
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',

  // Acceleration easing for exiting elements
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',

  // Sharp easing for quick transitions
  sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
} as const;

/**
 * Animation duration constants (in seconds)
 */
export const DURATIONS = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
} as const;

/**
 * Fade in animation
 */
export function fadeIn(
  element: HTMLElement | string,
  duration: number = DURATIONS.normal
): gsap.core.Tween {
  return gsap.from(element, {
    opacity: 0,
    duration,
    ease: 'power2.out',
  });
}

/**
 * Fade out animation
 */
export function fadeOut(
  element: HTMLElement | string,
  duration: number = DURATIONS.normal
): gsap.core.Tween {
  return gsap.to(element, {
    opacity: 0,
    duration,
    ease: 'power2.in',
  });
}

/**
 * Slide up animation (enter from bottom)
 */
export function slideUp(
  element: HTMLElement | string,
  duration: number = DURATIONS.normal
): gsap.core.Tween {
  return gsap.from(element, {
    y: 20,
    opacity: 0,
    duration,
    ease: 'power2.out',
  });
}

/**
 * Slide down animation (enter from top)
 */
export function slideDown(
  element: HTMLElement | string,
  duration: number = DURATIONS.normal
): gsap.core.Tween {
  return gsap.from(element, {
    y: -20,
    opacity: 0,
    duration,
    ease: 'power2.out',
  });
}

/**
 * Scale in animation
 */
export function scaleIn(
  element: HTMLElement | string,
  duration: number = DURATIONS.normal
): gsap.core.Tween {
  return gsap.from(element, {
    scale: 0.95,
    opacity: 0,
    duration,
    ease: 'power2.out',
  });
}

/**
 * Stagger animation for child elements
 */
export function staggerChildren(
  parent: HTMLElement | string,
  childSelector: string,
  stagger: number = 0.05
): gsap.core.Timeline {
  const tl = gsap.timeline();

  tl.from(`${parent} ${childSelector}`, {
    y: 20,
    opacity: 0,
    duration: DURATIONS.normal,
    stagger,
    ease: 'power2.out',
  });

  return tl;
}

/**
 * Scroll-triggered animation
 */
export function onScroll(
  element: HTMLElement | string,
  animation: gsap.TweenVars,
  options?: ScrollTrigger.Vars
): gsap.core.Tween {
  return gsap.from(element, {
    ...animation,
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      ...options,
    },
  });
}

/**
 * Kill all animations on an element
 */
export function killAnimations(element: HTMLElement | string): void {
  gsap.killTweensOf(element);
}

/**
 * Cleanup all ScrollTrigger instances
 */
export function cleanupScrollTriggers(): void {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}
