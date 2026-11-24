
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ButtonLink } from "@/components/ui/Button/Button";
import {
  useFeaturedCounters,
  useFeaturedParticles,
} from "./Featured.animation";
import styles from "./Featured.module.css";

gsap.registerPlugin(ScrollTrigger);

export function Featured() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useFeaturedCounters(sectionRef);
  useFeaturedParticles(sectionRef, canvasRef);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const context = gsap.context(() => {
      const entranceTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          once: true,
        },
      });

      entranceTimeline
        .fromTo(
          "[data-symbol='plus']",
          {
            rotation: -100,
            scale: 0.4,
            opacity: 0,
          },
          {
            rotation: 0,
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: "back.out(1.8)",
          },
          0
        )
        .fromTo(
          "[data-symbol='degree']",
          {
            rotation: -180,
            scale: 0.3,
            x: 12,
            y: -18,
            opacity: 0,
          },
          {
            rotation: 0,
            scale: 1,
            x: 0,
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "back.out(2)",
          },
          0.12
        )
        .fromTo(
          "[data-percent-top]",
          {
            rotation: -160,
            scale: 0.4,
            opacity: 0,
            svgOrigin: "15 13",
          },
          {
            rotation: 0,
            scale: 1,
            opacity: 1,
            duration: 0.9,
            ease: "back.out(2)",
          },
          0.18
        )
        .fromTo(
          "[data-percent-bottom]",
          {
            rotation: 160,
            scale: 0.4,
            opacity: 0,
            svgOrigin: "33 35",
          },
          {
            rotation: 0,
            scale: 1,
            opacity: 1,
            duration: 0.9,
            ease: "back.out(2)",
          },
          0.18
        )
        .fromTo(
          "[data-percent-slash]",
          {
            scaleY: 0,
            opacity: 0,
            transformOrigin: "50% 100%",
          },
          {
            scaleY: 1,
            opacity: 1,
            duration: 0.45,
            ease: "power2.out",
          },
          0.3
        );

      const symbolLoop = gsap.timeline({
        repeat: -1,
        repeatDelay: 4.45,
        delay: 1.2,
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          toggleActions: "play pause resume pause",
        },
      });

      symbolLoop
        .to(
          "[data-symbol='plus']",
          {
            rotation: 45,
            duration: 0.25,
            repeat: 1,
            yoyo: true,
            ease: "power2.inOut",
          },
          0
        )
        .to(
          "[data-symbol='degree']",
          {
            rotation: 25,
            y: -4,
            scale: 1.12,
            duration: 0.25,
            repeat: 1,
            yoyo: true,
            ease: "power2.inOut",
          },
          0
        )
        .to(
          "[data-percent-top]",
          {
            rotation: 360,
            duration: 0.55,
            svgOrigin: "15 13",
            ease: "power2.inOut",
          },
          0
        )
        .to(
          "[data-percent-bottom]",
          {
            rotation: -360,
            duration: 0.55,
            svgOrigin: "33 35",
            ease: "power2.inOut",
          },
          0
        )
        .to(
          "[data-percent-slash]",
          {
            scaleY: 0.7,
            duration: 0.25,
            repeat: 1,
            yoyo: true,
            transformOrigin: "50% 100%",
            ease: "power2.inOut",
          },
          0
        );
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles["featured-section"]}
      aria-labelledby="featured-title"
    >
      <canvas
        ref={canvasRef}
        className={styles["featured-particles"]}
        aria-hidden="true"
      />

      <div className={styles["featured-container"]} data-featured-content>
        <h2 id="featured-title" className={styles["visually-hidden"]}>
          eGenHub hakkında öne çıkanlar
        </h2>

        <ul className={styles["featured-stats"]}>
          <li className={styles["featured-stat"]} data-featured-stat>
            <div className={styles["featured-value"]}>
              <span
                className={styles["featured-number"]}
                data-counter
                data-target="150"
                data-suffix=""
                aria-label="150 üzeri"
              >
                0
              </span>
              <span
                className={styles["featured-symbol"]}
                data-symbol="plus"
                aria-hidden="true"
              >
                +
              </span>
            </div>
            <span className={styles["featured-label"]}>
              Proje Deneyimi
            </span>
          </li>

          <li className={styles["featured-stat"]} data-featured-stat>
            <div className={styles["featured-value"]}>
              <span
                className={styles["featured-number"]}
                data-counter
                data-target="20"
                data-suffix=""
                aria-label="20 üzeri"
              >
                0
              </span>
              <span
                className={styles["featured-symbol"]}
                data-symbol="plus"
                aria-hidden="true"
              >
                +
              </span>
            </div>
            <span className={styles["featured-label"]}>
              Farklı Sektör
            </span>
          </li>

          <li className={styles["featured-stat"]} data-featured-stat>
            <div className={styles["featured-value"]}>
              <span
                className={styles["featured-number"]}
                data-counter
                data-target="360"
                data-suffix=""
                aria-label="360 derece"
              >
                0
              </span>
              <span
                className={styles["featured-symbol"]}
                data-symbol="degree"
                aria-hidden="true"
              >
                °
              </span>
            </div>
            <span className={styles["featured-label"]}>
              Dijital Çözüm
            </span>
          </li>

          <li className={styles["featured-stat"]} data-featured-stat>
            <div className={styles["featured-value"]}>
              <span
                className={styles["featured-number"]}
                data-counter
                data-target="100"
                data-suffix=""
                aria-label="yüzde 100"
              >
                0
              </span>

              <svg
                className={styles["featured-percent"]}
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <g data-percent-top>
                  <circle
                    cx="15"
                    cy="13"
                    r="6"
                    fill="currentColor"
                  />
                  <circle
                    cx="13"
                    cy="11"
                    r="1.6"
                    fill="#B7FF3C"
                  />
                </g>

                <path
                  data-percent-slash
                  d="M34 8 L14 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />

                <g data-percent-bottom>
                  <circle
                    cx="33"
                    cy="35"
                    r="6"
                    fill="currentColor"
                  />
                  <circle
                    cx="31"
                    cy="33"
                    r="1.6"
                    fill="#B7FF3C"
                  />
                </g>
              </svg>
            </div>

            <span className={styles["featured-label"]}>
              Özgün Yaklaşım
            </span>
          </li>

          <li
            className={styles["featured-stat"]}
            data-featured-stat
            aria-label="Sonsuz yaratıcı olasılık"
          >
            <span
              className={styles["featured-infinity"]}
              aria-hidden="true"
            >
              <svg viewBox="0 0 120 64" role="presentation">
                <defs>
                  <linearGradient
                    id="infinity-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#B7FF3C" />
                    <stop offset="50%" stopColor="#50E3A4" />
                    <stop offset="100%" stopColor="#8B75FF" />
                  </linearGradient>
                </defs>

                <path
                  d="M60 32 C45 13 31 8 20 17 C5 29 15 49 30 49 C43 49 51 38 60 32 C69 26 77 15 90 15 C105 15 115 35 100 47 C89 56 75 51 60 32 Z"
                  fill="none"
                  stroke="url(#infinity-gradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <span className={styles["featured-label"]}>
              Yaratıcı Olasılık
            </span>
          </li>
        </ul>

        <div className={styles["featured-action"]}>
          <ButtonLink
            href="#work"
            variant="primary"
            theme="lime"
            size="lg"
            icon={<span aria-hidden="true">↗</span>}
          >
            Projeleri Keşfet
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
