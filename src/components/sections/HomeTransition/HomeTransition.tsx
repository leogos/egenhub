"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Hero } from "@/components/sections/Hero/Hero";
import { Featured } from "@/components/sections/Featured/Featured";
import styles from "./HomeTransition.module.css";

gsap.registerPlugin(ScrollTrigger);

export function HomeTransition() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    const hero = heroRef.current;
    const featured = featuredRef.current;

    if (!container || !stage || !hero || !featured) return;

    const context = gsap.context(() => {
      const heroContent = hero.querySelector("h1")?.parentElement;

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          pin: stage,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .to(heroContent, {
          scale: 0.84,
          y: -70,
          opacity: 0,
          filter: "blur(10px)",
          ease: "none",
          duration: 0.65,
        }, 0)
        .to(hero, {
          scale: 0.94,
          ease: "none",
          duration: 0.8,
        }, 0)
        .fromTo(featured, {
          yPercent: 100,
          clipPath: "inset(12% 0 0 0 round 28px)",
        }, {
          yPercent: 0,
          clipPath: "inset(0% 0 0 0 round 0px)",
          ease: "none",
          duration: 1,
        }, 0.15)
        .to(hero, {
          opacity: 0,
          ease: "none",
          duration: 0.25,
        }, 0.65);
    }, container);

    return () => context.revert();
  }, []);

  return (
    <div ref={containerRef} className={styles["transition-container"]}>
      <div ref={stageRef} className={styles["transition-stage"]}>
        <div ref={heroRef} className={styles["transition-hero"]}>
          <Hero />
        </div>
        <div ref={featuredRef} className={styles["transition-featured"]}>
          <Featured />
        </div>
      </div>
    </div>
  );
}
