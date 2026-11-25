
import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useWorkAnimation(
  sectionRef: RefObject<HTMLElement | null>,
  viewportRef: RefObject<HTMLDivElement | null>,
  trackRef: RefObject<HTMLDivElement | null>,
  projectCount: number,
) {
  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!section || !viewport || !track) return;

    const stage = section.querySelector<HTMLElement>("[data-work-stage]");
    if (!stage) return;

    const media = gsap.matchMedia();

    const createAnimation = (visibleCount: number) => {
      const images = Array.from(
        track.querySelectorAll<HTMLElement>("[data-work-image]"),
      );

      const contents = Array.from(
        track.querySelectorAll<HTMLElement>("[data-work-content]"),
      );

      const projectElements = Array.from(
        track.querySelectorAll<HTMLElement>("[data-work-project]"),
      );

      const groupCount = Math.max(
        0,
        Math.ceil(projectCount / visibleCount) - 1,
      );

      const entryDuration = 1.15;
      const introMoveDuration = 1.05;
      const projectMoveDuration = 1.05;
      const pauseDuration = 0;

      const totalDuration =
        entryDuration +
        (groupCount > 0
          ? introMoveDuration +
            (groupCount - 1) * (projectMoveDuration + pauseDuration)
          : 0);

      const getTravelDistance = () =>
        Math.max(0, track.scrollWidth - viewport.clientWidth);

      const transitionTimeline = gsap.timeline({
        scrollTrigger: {
          id: "work-transition",
          trigger: section,
          start: "top bottom",
          end: "top top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      transitionTimeline.fromTo(
        stage,
        { yPercent: 100, clipPath: "inset(12% 0 0 0 round 28px)" },
        {
          yPercent: 0,
          clipPath: "inset(0% 0 0 0 round 0px)",
          duration: 1,
          ease: "none",
        },
        0,
      );

      const previousFeaturedContent = document.querySelector<HTMLElement>(
        "[data-featured-content]",
      );

      if (previousFeaturedContent) {
        transitionTimeline.to(
          previousFeaturedContent,
          {
            scale: 0.84,
            y: -70,
            opacity: 0,
            filter: "blur(10px)",
            ease: "none",
            duration: 0.75,
          },
          0.25,
        );
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          id: "work-section",
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight * totalDuration}`,
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline.fromTo(
        images,
        {
          x: () => -viewport.clientWidth,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: entryDuration,
          ease: "none",
        },
        0,
      );

      timeline.fromTo(
        contents,
        {
          x: () => viewport.clientWidth,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: entryDuration,
          ease: "none",
        },
        0,
      );

      if (groupCount > 0) {
        for (let groupIndex = 0; groupIndex < groupCount; groupIndex++) {
          const moveDuration =
            groupIndex === 0 ? introMoveDuration : projectMoveDuration;

          const segmentStart =
            groupIndex === 0
              ? entryDuration
              : entryDuration +
                introMoveDuration +
                pauseDuration +
                (groupIndex - 1) * (projectMoveDuration + pauseDuration);

          timeline.to(
            track,
            {
              x: () =>
                -((getTravelDistance() * (groupIndex + 1)) / groupCount),
              duration: moveDuration,
              ease: "none",
            },
            segmentStart,
          );

          if (pauseDuration > 0 && groupIndex < groupCount - 1) {
            timeline.to(
              {},
              { duration: pauseDuration },
              segmentStart + moveDuration,
            );
          }
        }
      }

      let touchStartX = 0;
      let touchStartY = 0;
      let touchStartScroll = 0;
      let touchAxis: "x" | "y" | null = null;
      let touchTrigger: ScrollTrigger | null = null;

      const handleTouchStart = (event: TouchEvent) => {
        if (visibleCount >= 5 || event.touches.length !== 1) {
          touchTrigger = null;
          return;
        }

        const touch = event.touches.item(0);
        const trigger = timeline.scrollTrigger;

        if (!touch || !trigger) {
          touchTrigger = null;
          return;
        }

        const currentScroll = window.scrollY;

        if (
          currentScroll < trigger.start - 2 ||
          currentScroll > trigger.end + 2
        ) {
          touchTrigger = null;
          return;
        }

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartScroll = gsap.utils.clamp(
          trigger.start,
          trigger.end,
          currentScroll,
        );
        touchAxis = null;
        touchTrigger = trigger;
      };

      const handleTouchMove = (event: TouchEvent) => {
        if (visibleCount >= 5 || !touchTrigger) return;

        const touch = event.touches.item(0);

        if (!touch || event.touches.length !== 1) return;

        const deltaX = touchStartX - touch.clientX;
        const deltaY = touchStartY - touch.clientY;

        if (!touchAxis) {
          if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 8) return;

          touchAxis =
            Math.abs(deltaX) > Math.abs(deltaY) ? "x" : "y";
        }

        if (touchAxis !== "x") return;

        event.preventDefault();

        const targetScroll = gsap.utils.clamp(
          touchTrigger.start,
          touchTrigger.end,
          touchStartScroll + deltaX * 1.85,
        );

        window.scrollTo(0, targetScroll);
      };

      const handleTouchEnd = () => {
        touchTrigger = null;
        touchAxis = null;
      };

      const handleFocusIn = (event: FocusEvent) => {
        const target = event.target;

        if (!(target instanceof HTMLElement)) return;

        const projectElement = target.closest<HTMLElement>(
          "[data-work-project]",
        );

        if (!projectElement) return;

        const projectIndex = projectElements.indexOf(projectElement);

        if (projectIndex < 0) return;

        const targetBounds = target.getBoundingClientRect();
        const viewportBounds = viewport.getBoundingClientRect();

        const isFullyVisible =
          targetBounds.left >= viewportBounds.left &&
          targetBounds.right <= viewportBounds.right &&
          targetBounds.top >= viewportBounds.top &&
          targetBounds.bottom <= viewportBounds.bottom;

        if (isFullyVisible) return;

        const groupIndex = Math.floor(projectIndex / visibleCount);
        const targetProgress = (1 + groupIndex) / totalDuration;

        const trigger = timeline.scrollTrigger;

        if (!trigger) return;

        const targetScroll =
          trigger.start + (trigger.end - trigger.start) * targetProgress;

        window.scrollTo({
          top: targetScroll,
          behavior: "auto",
        });
      };

      viewport.addEventListener("focusin", handleFocusIn);

      if (visibleCount < 5) {
        viewport.addEventListener("touchstart", handleTouchStart, {
          passive: true,
        });

        viewport.addEventListener("touchmove", handleTouchMove, {
          passive: false,
        });

        viewport.addEventListener("touchend", handleTouchEnd);
        viewport.addEventListener("touchcancel", handleTouchEnd);
      }

      return () => {
        viewport.removeEventListener("focusin", handleFocusIn);

        viewport.removeEventListener("touchstart", handleTouchStart);
        viewport.removeEventListener("touchmove", handleTouchMove);
        viewport.removeEventListener("touchend", handleTouchEnd);
        viewport.removeEventListener("touchcancel", handleTouchEnd);

        transitionTimeline.scrollTrigger?.kill();
        transitionTimeline.kill();

        timeline.scrollTrigger?.kill();
        timeline.kill();
      };
    };

    media.add(
      "(max-width: 639px) and (prefers-reduced-motion: no-preference)",
      () => createAnimation(1),
    );

    media.add(
      "(min-width: 640px) and (max-width: 1157px) and (prefers-reduced-motion: no-preference)",
      () => createAnimation(2),
    );

    media.add(
      "(min-width: 1158px) and (prefers-reduced-motion: no-preference)",
      () => createAnimation(5),
    );

    return () => media.revert();
  }, [projectCount, sectionRef, viewportRef, trackRef]);
}
