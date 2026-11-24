
"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useHeroGalaxy } from "./Hero.animation";
import styles from "./Hero.module.css";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useHeroGalaxy(heroRef, canvasRef);

  const handleScroll = () => {
    const transitionContainer = document.querySelector<HTMLElement>(
      '[class*="transition-container"]'
    );

    if (!transitionContainer) return;

    const featured = transitionContainer.querySelector<HTMLElement>(
      '[class*="transition-featured"]'
    );

    if (!featured) return;

    const trigger = ScrollTrigger.getAll().find(
      (item) => item.trigger === transitionContainer
    );

    if (!trigger?.animation) return;

    const timeline = trigger.animation as gsap.core.Timeline;

    const featuredTween = timeline
      .getChildren(false, true, false)
      .find((child) =>
        (child as gsap.core.Tween).targets().includes(featured)
      ) as gsap.core.Tween | undefined;

    if (!featuredTween) return;

    const timelineDuration = timeline.duration();

    if (!timelineDuration) return;

    const targetProgress = featuredTween.endTime() / timelineDuration;

    const targetScroll =
      trigger.start +
      (trigger.end - trigger.start) * targetProgress;

    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={heroRef}
      className={styles.hero}
      aria-labelledby="hero-title"
    >
      <canvas
        ref={canvasRef}
        className={styles["dot-field"]}
        aria-hidden="true"
      />

      <div className={styles.content}>
        <h1 id="hero-title" className={styles.title}>
          <span>Make way for</span>
          <span>what&apos;s next.</span>
        </h1>

        <h2 className={styles.description}>
          <span>We shape brands, platforms and digital experiences</span>
          <span>where strategy, design and technology move as one.</span>
        </h2>
      </div>

      <button
        type="button"
        className={styles["scroll-indicator"]}
        aria-label="Scroll to explore"
        onClick={handleScroll}
      >
        <span className={styles["scroll-indicator-icon"]}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 5v14m-7-7 7 7 7-7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <span className={styles["scroll-indicator-label"]}>
          SCROLL TO EXPLORE
        </span>
      </button>
    </section>
  );
}
