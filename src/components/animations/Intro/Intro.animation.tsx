"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./Intro.module.css";

function waitForMedia(
  media: HTMLImageElement | HTMLVideoElement
): Promise<void> {
  if (media instanceof HTMLImageElement) {
    if (media.complete) {
      return media.decode().catch(() => undefined);
    }

    return new Promise((resolve) => {
      media.addEventListener("load", () => resolve(), { once: true });
      media.addEventListener("error", () => resolve(), { once: true });
    });
  }

  if (media.readyState >= 2) return Promise.resolve();

  return new Promise((resolve) => {
    media.addEventListener("loadeddata", () => resolve(), { once: true });
    media.addEventListener("error", () => resolve(), { once: true });
  });
}

export function IntroAnimation() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const mark = markRef.current;
    const shell = document.querySelector<HTMLElement>("[data-site-shell]");
    const target = document.querySelector<HTMLElement>("[data-brand-mark]");

    if (!overlay || !mark || !shell || !target) {
      gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none" });
      return;
    }

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none" });
      return;
    }

    const startedAt = performance.now();
    const minimumDisplayTime = 1200;

    let cancelled = false;
    let maximumWaitTimer = 0;
    let minimumWaitTimer = 0;
    let loadHandler: (() => void) | undefined;
    let timeline: gsap.core.Timeline | undefined;

    const finish = () => {
      gsap.set(target, { clearProps: "opacity" });
      gsap.set(overlay, {
        autoAlpha: 0,
        pointerEvents: "none",
      });
      shell.removeAttribute("aria-busy");
      document.documentElement.classList.remove("intro-is-active");
    };

    document.documentElement.classList.add("intro-is-active");
    shell.setAttribute("aria-busy", "true");

    gsap.set(target, { opacity: 0 });
    gsap.set(overlay, {
      autoAlpha: 1,
      pointerEvents: "auto",
    });
    gsap.set(mark, {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
    });

    const pulse = gsap.to(mark, {
      scale: 1.08,
      duration: 0.55,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    const pageLoad =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            loadHandler = () => resolve();
            window.addEventListener("load", loadHandler, { once: true });
          });

    const fontsReady = document.fonts?.ready ?? Promise.resolve();

    const criticalMedia = Array.from(
      document.querySelectorAll<HTMLImageElement | HTMLVideoElement>(
        'img[fetchpriority="high"], img[data-intro-critical], video[data-intro-critical]'
      )
    );

    const mediaReady = Promise.all(
      criticalMedia.map(waitForMedia)
    );

    const assetsReady = Promise.all([
      pageLoad,
      fontsReady,
      mediaReady,
    ]).then(() => undefined);

    const maximumWait = new Promise<void>((resolve) => {
      maximumWaitTimer = window.setTimeout(resolve, 8000);
    });

    void Promise.race([assetsReady, maximumWait]).then(async () => {
      window.clearTimeout(maximumWaitTimer);

      if (loadHandler) {
        window.removeEventListener("load", loadHandler);
        loadHandler = undefined;
      }

      const remainingTime = Math.max(
        0,
        minimumDisplayTime - (performance.now() - startedAt)
      );

      if (remainingTime > 0) {
        await new Promise<void>((resolve) => {
          minimumWaitTimer = window.setTimeout(resolve, remainingTime);
        });
      }

      if (cancelled) return;

      pulse.kill();

      gsap.set(mark, {
        x: 0,
        y: 0,
        scale: 1,
      });

      const startRect = mark.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      if (!startRect.width || !targetRect.width) {
        finish();
        return;
      }

      const deltaX =
        targetRect.left +
        targetRect.width / 2 -
        (startRect.left + startRect.width / 2);

      const deltaY =
        targetRect.top +
        targetRect.height / 2 -
        (startRect.top + startRect.height / 2);

      const targetScale = targetRect.width / startRect.width;

      timeline = gsap.timeline({
        onComplete: finish,
      });

      timeline
        .to(mark, {
          x: deltaX,
          y: deltaY,
          scale: targetScale,
          duration: 1.15,
          ease: "power4.inOut",
        })
        .to(
          target,
          {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
          },
          "-=0.2"
        )
        .to(
          mark,
          {
            opacity: 0,
            duration: 0.15,
          },
          "<"
        )
        .to(
          overlay,
          {
            opacity: 0,
            duration: 1.1,
            ease: "power2.out",
          },
          "-=0.1"
        );
    });

    return () => {
      cancelled = true;

      window.clearTimeout(maximumWaitTimer);
      window.clearTimeout(minimumWaitTimer);

      if (loadHandler) {
        window.removeEventListener("load", loadHandler);
      }

      pulse.kill();
      timeline?.kill();

      gsap.set(target, { clearProps: "opacity" });
      gsap.set(overlay, {
        autoAlpha: 0,
        pointerEvents: "none",
      });

      shell.removeAttribute("aria-busy");
      document.documentElement.classList.remove("intro-is-active");
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className={styles["intro-transition"]}
      aria-hidden="true"
    >
      <span
        ref={markRef}
        className={styles["intro-transition-mark"]}
      />
    </div>
  );
}
