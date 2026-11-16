"use client";

/**
 * The only place GSAP is imported. Every hook here:
 *  - runs only in client components, before first paint (no flash of the un-animated state);
 *  - animates transform + opacity only;
 *  - does nothing under `prefers-reduced-motion: reduce` — content just renders in its final state;
 *  - reverts everything it created on unmount (scoped — it never touches other components' triggers).
 *
 * Elements that animate in on page load / scroll carry a `data-reveal` attribute. CSS pre-hides
 * them until a hook here takes over (see "Motion" in globals.css), so they don't flash before hydration.
 */
import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const MOTION_OK = "(prefers-reduced-motion: no-preference)";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // Results appearing or collapsing move everything below them. ScrollTrigger only re-measures on
  // window resize, so re-measure on content resize too — otherwise a section could scroll into
  // view while its (stale) trigger still keeps it hidden.
  let timer: ReturnType<typeof setTimeout>;
  new ResizeObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => ScrollTrigger.refresh(), 100);
  }).observe(document.body);
}

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Select = (selector: string) => HTMLElement[];

/** Runs `setup` once on mount, scoped to the ref'd element, only while motion is allowed. */
function useGsap<T extends HTMLElement>(setup: (root: T, select: Select) => void) {
  const ref = useRef<T>(null);

  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => setup(root, gsap.utils.selector(root)));
    return () => mm.revert();
    // Mount-only by design: these are entrance animations, they never re-run on re-render.
  }, []);

  return ref;
}

/** Take over CSS-pre-hidden `data-reveal` elements: cancel the "script never arrived" failsafe. */
function claim(targets: HTMLElement[]) {
  for (const el of targets) el.style.animation = "none";
  return targets;
}

/**
 * Page hero intro: heading words stagger up, subtitle fades in, the form slides up,
 * and the dot-grid drifts slower than the page while the hero scrolls away.
 */
export function useHeroIntro<T extends HTMLElement = HTMLDivElement>() {
  return useGsap<T>((root, select) => {
    const words = claim(select("[data-hero-word]"));
    const subtitle = claim(select("[data-hero-subtitle]"));
    const body = claim(select("[data-hero-body]"));

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.fromTo(
      words,
      { y: 48, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.08, clearProps: "transform" },
      0,
    );
    tl.fromTo(subtitle, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.5);
    if (body.length > 0) {
      tl.fromTo(body, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, clearProps: "transform" }, 0.6);
    }

    const dotGrid = select("[data-dot-grid]");
    if (dotGrid.length > 0) {
      gsap.to(dotGrid, {
        y: 40,
        ease: "none",
        scrollTrigger: { trigger: root, start: 0, end: "bottom top", scrub: 1 },
      });
    }
  });
}

export type RevealOptions = {
  /** Offset the elements slide in from, in px. */
  x?: number;
  y?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
  /** ScrollTrigger start, relative to the group. */
  start?: string;
  /**
   * Reveal one after another on a timeline instead of a plain stagger. Elements marked
   * `data-reveal="line-x"` / `"line-y"` are connector lines: they grow from their start edge.
   */
  sequence?: boolean;
};

/**
 * Scroll reveal for a group: every `data-reveal` descendant of the ref'd element fades and
 * slides in — once — when the group scrolls into view. Don't nest groups.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  x = 0,
  y = 32,
  duration = 0.6,
  stagger = 0.1,
  delay = 0,
  start = "top 85%",
  sequence = false,
}: RevealOptions = {}) {
  return useGsap<T>((root, select) => {
    const targets = claim(select("[data-reveal]"));
    const scrollTrigger = { trigger: root, start, once: true };

    if (!sequence) {
      gsap.fromTo(
        targets,
        { x, y, opacity: 0 },
        { x: 0, y: 0, opacity: 1, duration, ease: "power2.out", stagger, delay, scrollTrigger, clearProps: "transform" },
      );
      return;
    }

    const tl = gsap.timeline({ scrollTrigger, delay, defaults: { ease: "power2.out" } });
    targets.forEach((el, i) => {
      const at = i === 0 ? 0 : "-=0.2";
      const kind = el.dataset.reveal;
      if (kind === "line-x") {
        tl.fromTo(el, { scaleX: 0, opacity: 1, transformOrigin: "left center" }, { scaleX: 1, duration: 0.4 }, at);
      } else if (kind === "line-y") {
        tl.fromTo(el, { scaleY: 0, opacity: 1, transformOrigin: "center top" }, { scaleY: 1, duration: 0.4 }, at);
      } else {
        tl.fromTo(el, { x, y, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.5, clearProps: "transform" }, at);
      }
    });
  });
}
