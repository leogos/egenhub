"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/Button/Button";
import { useFeaturedParticles } from "../Featured/Featured.animation";
import { useWorkAnimation } from "./Work.animation";
import styles from "./Work.module.css";

const projects = [
  {
    title: "Digital Experiences",
    description:
      "Building distinctive digital experiences that connect brands, people and technology.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=85",
    imageAlt: "",
    href: "/",
    technologies: ["Next.js", "TypeScript", "GSAP"],
  },
  {
    title: "Brand & Identity",
    description:
      "Creating meaningful visual identities with a consistent and recognizable digital presence.",
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1400&q=85",
    imageAlt: "",
    href: "/",
    technologies: ["Figma", "Illustrator", "Next.js"],
  },
  {
    title: "Digital Platforms",
    description:
      "Designing and developing scalable platforms focused on usability and performance.",
    image:
      "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1400&q=85",
    imageAlt: "",
    href: "/",
    technologies: ["Next.js", "Payload CMS", "PostgreSQL"],
  },
  {
    title: "Interactive Products",
    description:
      "Combining technology, motion and thoughtful interaction to create engaging products.",
    image:
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1400&q=85",
    imageAlt: "",
    href: "/",
    technologies: ["React", "TypeScript", "GSAP"],
  },
];

const workItemCount = projects.length + 1;

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 19L19 5M8 5H19V16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useFeaturedParticles(stageRef, canvasRef);

  useWorkAnimation(sectionRef, viewportRef, trackRef, workItemCount);

  return (
    <section
      ref={sectionRef}
      id="work"
      className={styles["work-section"]}
      aria-labelledby="work-heading"
    >
      <div ref={stageRef} className={styles["work-stage"]} data-work-stage>
      <canvas
        ref={canvasRef}
        className={styles["work-particles"]}
        aria-hidden="true"
      />

      <div className={styles["work-container"]}>
        <div ref={viewportRef} className={styles["work-viewport"]}>
          <div ref={trackRef} className={styles["work-track"]}>
            <article
              className={`${styles["work-project"]} ${styles["work-intro"]}`}
              data-work-project
              aria-labelledby="work-heading"
            >
              <div
                className={`${styles["work-project-image"]} ${styles["work-intro-visual"]}`}
                data-work-image
                aria-hidden="true"
              />

              <div
                className={`${styles["work-project-content"]} ${styles["work-intro-content"]}`}
                data-work-content
              >
                <h2 id="work-heading" className={styles["work-intro-title"]}>
                  Our Projects
                </h2>

                <p className={styles["work-intro-description"]}>
                  Explore live projects we&apos;ve designed, built and launched
                  at eGenHub.
                </p>
              </div>
            </article>

            {projects.map((project, index) => {
              const headingId = `work-project-title-${index + 1}`;

              return (
                <article
                  key={project.title}
                  className={styles["work-project"]}
                  data-work-project
                  aria-labelledby={headingId}
                >
                  <div className={styles["work-project-image"]} data-work-image>
                    {index !== projects.length - 1 && (
<Image
                      src={project.image}
                      alt={project.imageAlt}
                      fill
                      sizes="(min-width: 1280px) calc(20vw - 24px), (min-width: 640px) calc(50vw - 24px), calc(100vw - 20px)"
                      quality={80}
                      loading="lazy"
                    />
)}
                  

                  

                  
                    <ButtonLink
                        href={project.href}
                        variant="secondary"
                        theme="lime"
                        size="md"
                        icon={<ArrowIcon />}
                        aria-label={`Explore ${project.title}`}
                        className={index === projects.length - 1 ? styles["work-arrow-button-hidden"] : styles["work-arrow-button"]}
                        style={
                          {
                            "--button-icon-size": "18px",
                            "--button-hover-fill": "var(--color-primary)",
                            "--button-hover-text": "var(--color-background)",
                          } as CSSProperties
                        }
                      />
                  </div>

                  <div
                    className={styles["work-project-content"]}
                    data-work-content
                  >
                    <div className={styles["work-project-heading"]}>
                      <h3
                        id={headingId}
                        className={styles["work-project-title"]}
                      >
                        {project.title}
                      </h3>


                    </div>

                    <p className={styles["work-project-description"]}>
                      {project.description}
                    </p>

                    {index !== projects.length - 1 && (
<div className={styles["work-project-tech"]}>
                      <span className={styles["work-project-tech-label"]}>
                        TECH STACK
                      </span>

                      <ul
                        className={styles["work-project-tech-list"]}
                        aria-label={`Technologies used in ${project.title}`}
                      >
                        {project.technologies.map((technology) => (
                          <li key={technology}>{technology}</li>
                        ))}
                      </ul>
                    </div>
                    )}

                    {index === projects.length - 1 && (
                      <ButtonLink
                        href="/projects"
                        variant="primary"
                        theme="violet"
                        size="md"
                        icon={<ArrowIcon />}
                        iconPosition="end"
                        className={styles["work-project-cta"]}
                      >
                        Explore all projects
                      </ButtonLink>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
