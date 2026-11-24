"use client";

import { useRef } from "react";
import { ButtonLink } from "@/components/ui/Button/Button";
import {
  useFeaturedCounters,
  useFeaturedParticles,
} from "./Featured.animation";
import styles from "./Featured.module.css";

export function Featured() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useFeaturedCounters(sectionRef);
  useFeaturedParticles(sectionRef, canvasRef);

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

      <div className={styles["featured-container"]}>
        <h2 id="featured-title" className={styles["visually-hidden"]}>
          eGenHub hakkında öne çıkanlar
        </h2>

        <ul className={styles["featured-stats"]}>
          <li className={styles["featured-stat"]} data-featured-stat>
            <span
              className={styles["featured-number"]}
              data-counter
              data-target="150"
              data-suffix="+"
              aria-label="150 üzeri"
            >
              0+
            </span>
            <span className={styles["featured-label"]}>Proje Deneyimi</span>
          </li>

          <li className={styles["featured-stat"]} data-featured-stat>
            <span
              className={styles["featured-number"]}
              data-counter
              data-target="20"
              data-suffix="+"
              aria-label="20 üzeri"
            >
              0+
            </span>
            <span className={styles["featured-label"]}>Farklı Sektör</span>
          </li>

          <li className={styles["featured-stat"]} data-featured-stat>
            <span
              className={styles["featured-number"]}
              data-counter
              data-target="360"
              data-suffix="°"
              aria-label="360 derece"
            >
              0°
            </span>
            <span className={styles["featured-label"]}>Dijital Çözüm</span>
          </li>

          <li className={styles["featured-stat"]} data-featured-stat>
            <span
              className={styles["featured-number"]}
              data-counter
              data-target="100"
              data-suffix="%"
              aria-label="yüzde 100"
            >
              0%
            </span>
            <span className={styles["featured-label"]}>Özgün Yaklaşım</span>
          </li>

          <li
            className={styles["featured-stat"]}
            data-featured-stat
            aria-label="Sonsuz yaratıcı olasılık"
          >
            <span className={styles["featured-infinity"]} aria-hidden="true">
              <svg
                viewBox="0 0 240 128"
                role="presentation"
                xmlns="http://www.w3.org/2000/svg"
              >
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
                    <animateTransform
                      attributeName="gradientTransform"
                      type="rotate"
                      from="0 0.5 0.5"
                      to="360 0.5 0.5"
                      dur="8s"
                      repeatCount="indefinite"
                    />
                  </linearGradient>
                </defs>

                <path
                  d="M120 64 C91 22 62 16 39 35 C8 60 29 100 60 100 C85 100 103 79 120 64 C137 49 155 28 180 28 C211 28 232 68 201 93 C178 112 149 106 120 64 Z"
                  fill="none"
                  stroke="url(#infinity-gradient)"
                  strokeWidth="13"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </span>
            <span className={styles["featured-label"]}>Yaratıcı Olasılık</span>
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
