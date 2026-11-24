"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import styles from "./Header.module.css";
import { useHeaderMenuAnimation } from "./Header.animation";

const menuItems = [
  { number: "01", label: "The Studio" },
  { number: "02", label: "What We Do" },
  { number: "03", label: "Selected Work" },
  { number: "04", label: "Contact" },
];

const PANEL_COUNT = 6;

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useHeaderMenuAnimation(menuRef, isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

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
      document.body.style.paddingRight = previousPaddingRight;
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
