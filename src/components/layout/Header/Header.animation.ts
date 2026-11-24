"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";

type HeaderMenuAnimation = {
  timeline: gsap.core.Timeline | null;
  panels: HTMLElement[];
  content: HTMLElement;
  desktop: boolean;
  reducedMotion: boolean;
};

export function useHeaderMenuAnimation(
  menuRef: RefObject<HTMLDivElement | null>,
  isOpen: boolean
) {
  const animationRef = useRef<HeaderMenuAnimation | null>(null);
  const previousOpen = useRef(false);

  useLayoutEffect(() => {
    const menu = menuRef.current;

    if (!menu) return;

    const panels = Array.from(
      menu.querySelectorAll<HTMLElement>("[data-menu-panel]")
    );

    const content = menu.querySelector<HTMLElement>(
      "[data-menu-content]"
    );

    if (panels.length !== 6 || !content) return;

    const desktop = window.matchMedia("(min-width: 1280px)").matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    gsap.set(menu, { visibility: "hidden" });
    gsap.set(content, { autoAlpha: 0, y: 18 });

    gsap.set(
      panels,
      desktop
        ? {
            scaleX: 0,
            scaleY: 1,
            transformOrigin: "right center",
          }
        : {
            scaleX: 1,
            scaleY: 0,
            transformOrigin: "center top",
          }
    );

    let timeline: gsap.core.Timeline | null = null;

    if (!reducedMotion) {
      timeline = gsap.timeline({
        paused: true,
        onReverseComplete: () => {
          gsap.set(menu, { visibility: "hidden" });
        },
      });

      timeline.to(
        panels,
        desktop
          ? {
              scaleX: 1,
              duration: 0.65,
              stagger: { each: 0.075, from: "end" },
              ease: "power3.inOut",
            }
          : {
              scaleY: 1,
              duration: 0.65,
              stagger: { each: 0.075, from: "start" },
              ease: "power3.inOut",
            }
      );

      timeline.to(
        content,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
        },
        "-=0.16"
      );
    }

    animationRef.current = {
      timeline,
      panels,
      content,
      desktop,
      reducedMotion,
    };

    return () => {
      timeline?.kill();
      gsap.killTweensOf(panels);
      gsap.killTweensOf(content);
      animationRef.current = null;
    };
  }, [menuRef]);

  useLayoutEffect(() => {
    const menu = menuRef.current;
    const animation = animationRef.current;

    if (!menu || !animation) return;

    const { timeline, panels, content, desktop, reducedMotion } = animation;

    if (isOpen) {
      gsap.set(menu, { visibility: "visible" });

      if (reducedMotion) {
        gsap.set(panels, { scaleX: 1, scaleY: 1 });
        gsap.set(content, { autoAlpha: 1, y: 0 });
      } else {
        gsap.set(panels, {
          transformOrigin: desktop ? "right center" : "center top",
        });
        timeline?.play();
      }
    } else if (previousOpen.current) {
      if (reducedMotion) {
        gsap.set(content, { autoAlpha: 0, y: 18 });
        gsap.set(
          panels,
          desktop
            ? { scaleX: 0, scaleY: 1 }
            : { scaleX: 1, scaleY: 0 }
        );
        gsap.set(menu, { visibility: "hidden" });
      } else {
        if (timeline && timeline.progress() >= 0.999) {
          gsap.set(panels, {
            transformOrigin: desktop ? "left center" : "center bottom",
          });
        }

        timeline?.reverse();
      }
    }

    previousOpen.current = isOpen;
  }, [isOpen, menuRef]);
}
