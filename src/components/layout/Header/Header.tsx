
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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

    const html = document.documentElement;
    const body = document.body;
    const toggleButton = toggleRef.current;
    const scrollY = window.scrollY;

    const previousHtmlOverflow = html.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyLeft = body.style.left;
    const previousBodyRight = body.style.right;
    const previousBodyWidth = body.style.width;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - html.clientWidth;
    const currentPaddingRight =
      Number.parseFloat(getComputedStyle(body).paddingRight) || 0;

    html.style.overflow = "hidden";

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
    }

    const firstLink = menuRef.current?.querySelector<HTMLAnchorElement>(
      "nav a",
    );

    firstLink?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }

      if (event.key === "Tab") {
        const links = menuRef.current?.querySelectorAll<HTMLAnchorElement>(
          "nav a",
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

    const handleTouchMove = (event: TouchEvent) => {
      const target = event.target;

      if (
        !(target instanceof Node) ||
        !menuRef.current?.contains(target)
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("touchmove", handleTouchMove);

      html.style.overflow = previousHtmlOverflow;

      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.left = previousBodyLeft;
      body.style.right = previousBodyRight;
      body.style.width = previousBodyWidth;
      body.style.overflow = previousBodyOverflow;
      body.style.paddingRight = previousBodyPaddingRight;

      window.scrollTo(0, scrollY);

      toggleButton?.focus();
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
        </div>
      </div>
    </>
  );
}
