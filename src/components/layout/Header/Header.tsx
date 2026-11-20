"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import styles from "./Header.module.css";

const menuItems = [
  { number: "01", label: "The Studio" },
  { number: "02", label: "What We Do" },
  { number: "03", label: "Selected Work" },
  { number: "04", label: "Contact" },
];

const PANEL_COUNT = 6;

type MenuAnimation = {
  timeline: gsap.core.Timeline | null;
  panels: HTMLElement[];
  content: HTMLElement;
  desktop: boolean;
  reducedMotion: boolean;
};

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const animationRef = useRef<MenuAnimation | null>(null);
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

    if (panels.length !== PANEL_COUNT || !content) return;

    const desktop = window.matchMedia("(min-width: 1280px)").matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    gsap.set(menu, { visibility: "hidden" });
    gsap.set(content, { autoAlpha: 0, y: 18 });

    if (desktop) {
      gsap.set(panels, {
        scaleX: 0,
        scaleY: 1,
        transformOrigin: "right center",
      });
    } else {
      gsap.set(panels, {
        scaleX: 1,
        scaleY: 0,
        transformOrigin: "center top",
      });
    }

    let timeline: gsap.core.Timeline | null = null;

    if (!reducedMotion) {
      timeline = gsap.timeline({
        paused: true,
        onReverseComplete: () => {
          gsap.set(menu, { visibility: "hidden" });
        },
      });

      if (desktop) {
        timeline.to(panels, {
          scaleX: 1,
          duration: 0.65,
          stagger: {
            each: 0.075,
            from: "end",
          },
          ease: "power3.inOut",
        });
      } else {
        timeline.to(panels, {
          scaleY: 1,
          duration: 0.65,
          stagger: {
            each: 0.075,
            from: "start",
          },
          ease: "power3.inOut",
        });
      }

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
  }, []);

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
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const firstLink = menuRef.current?.querySelector<HTMLAnchorElement>(
      "nav a"
    );

    firstLink?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }

      if (event.key === "Tab") {
        const links = menuRef.current?.querySelectorAll<HTMLAnchorElement>(
          "nav a"
        );

        if (!links?.length) return;

        const first = links[0];
        const last = links[links.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      toggleRef.current?.focus();
    };
  }, [isOpen]);

  return (
    <>
      <header className={styles["site-header"]}>
        <div className={`container ${styles["site-header-inner"]}`}>
          <Link
            className={styles["site-brand"]}
            href="/"
            aria-label="eGenHub home"
          >
            <span
              className={styles["site-brand-mark"]}
              data-brand-mark
              aria-hidden="true"
            />
            <span className={styles["site-brand-wordmark"]}>
              eGenHub
            </span>
          </Link>

          <button
            ref={toggleRef}
            type="button"
            className={styles["site-menu-toggle"]}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="site-menu"
            onClick={() => setIsOpen((current) => !current)}
          >
            <span className={styles["site-menu-icon"]} aria-hidden="true">
              <span className={styles["site-menu-icon-line"]} />
              <span className={styles["site-menu-icon-line"]} />
            </span>
            <span className={styles["site-menu-toggle-label"]}>
              {isOpen ? "CLOSE" : "MENU"}
            </span>
          </button>
        </div>
      </header>

      <div
        className={styles["site-menu"]}
        id="site-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className={styles["site-menu-panels"]} aria-hidden="true">
          {Array.from({ length: PANEL_COUNT }, (_, index) => (
            <div
              key={index}
              className={styles["site-menu-panel"]}
              data-menu-panel
            />
          ))}
        </div>

        <div
          className={styles["site-menu-content"]}
          data-menu-content
        >
          <div className={styles["site-menu-topline"]}>
            <span>EXPLORE EGENHUB</span>
            <span>MENU / 001—004</span>
          </div>

          <nav
            className={styles["site-menu-navigation"]}
            aria-label="Main navigation"
          >
            {menuItems.map((item) => (
              <Link
                key={item.number}
                href="/"
                className={styles["site-menu-link"]}
                onClick={() => setIsOpen(false)}
              >
                <span className={styles["site-menu-number"]}>
                  {item.number}
                </span>
                <span className={styles["site-menu-link-label"]}>
                  {item.label}
                </span>
                <span
                  className={styles["site-menu-arrow"]}
                  aria-hidden="true"
                >
                  ↗
                </span>
              </Link>
            ))}
          </nav>

          <div className={styles["site-menu-bottom"]}>
            <span>IDEAS INTO DIGITAL EXPERIENCES.</span>
            <span>eGenHub © 2026</span>
          </div>
        </div>
      </div>
    </>
  );
}
