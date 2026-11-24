
"use client";

import { useRef } from "react";
import { useHeroGalaxy } from "./Hero.animation";
import styles from "./Hero.module.css";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useHeroGalaxy(heroRef, canvasRef);

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
    </section>
  );
}
