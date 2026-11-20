"use client";

import Link from "next/link";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "tertiary";
type ButtonTheme = "lime" | "light" | "dark";
type ButtonSize = "sm" | "md" | "lg";
type IconPosition = "start" | "end";

type ButtonStyleProps = {
  variant?: ButtonVariant;
  theme?: ButtonTheme;
  size?: ButtonSize;
  iconPosition?: IconPosition;
  className?: string;
};

type ButtonContentProps =
  | {
      children: ReactNode;
      icon?: ReactNode;
      "aria-label"?: string;
    }
  | {
      children?: never;
      icon: ReactNode;
      "aria-label": string;
    };

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "className" | "aria-label"
>;

type NativeLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "className" | "aria-label" | "href"
>;

type ButtonProps = ButtonStyleProps & ButtonContentProps & NativeButtonProps;

type ButtonLinkProps = ButtonStyleProps &
  ButtonContentProps &
  NativeLinkProps & {
    href: string;
  };

type ButtonContentViewProps = {
  icon?: ReactNode;
  iconPosition: IconPosition;
  children?: ReactNode;
};

type MagneticState = {
  baseX: number;
  baseY: number;
  contentBaseX: number;
  contentBaseY: number;
  buttonX: (value: number) => void;
  buttonY: (value: number) => void;
  contentX: (value: number) => void;
  contentY: (value: number) => void;
  content: HTMLElement;
};

const magneticField = 36;
const magneticElements = new Set<HTMLElement>();
const magneticStates = new WeakMap<HTMLElement, MagneticState>();

let activeMagneticElement: HTMLElement | null = null;
let pointerListenerAttached = false;

function supportsMagnetic() {
  return (
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function getTransformValue(element: HTMLElement, axis: "x" | "y") {
  const value = gsap.getProperty(element, axis);
  const parsed =
    typeof value === "number" ? value : Number.parseFloat(String(value));

  return Number.isFinite(parsed) ? parsed : 0;
}

function initializeMagnetic(element: HTMLElement) {
  if (magneticStates.has(element)) return;

  const content = element.querySelector<HTMLElement>(
    `.${styles["button-content"]}`
  );

  if (!content) return;

  const baseX = getTransformValue(element, "x");
  const baseY = getTransformValue(element, "y");
  const contentBaseX = getTransformValue(content, "x");
  const contentBaseY = getTransformValue(content, "y");

  const state: MagneticState = {
    baseX,
    baseY,
    contentBaseX,
    contentBaseY,
    buttonX: gsap.quickTo(element, "x", {
      duration: 0.3,
      ease: "power3.out",
    }),
    buttonY: gsap.quickTo(element, "y", {
      duration: 0.3,
      ease: "power3.out",
    }),
    contentX: gsap.quickTo(content, "x", {
      duration: 0.25,
      ease: "power3.out",
    }),
    contentY: gsap.quickTo(content, "y", {
      duration: 0.25,
      ease: "power3.out",
    }),
    content,
  };

  magneticStates.set(element, state);
}

function releaseMagnetic(element: HTMLElement) {
  const state = magneticStates.get(element);

  if (!state) return;

  gsap.killTweensOf(element);
  gsap.killTweensOf(state.content);

  gsap.to(element, {
    x: state.baseX,
    y: state.baseY,
    duration: 0.85,
    ease: "elastic.out(1.3, 0.28)",
    overwrite: true,
  });

  gsap.to(state.content, {
    x: state.contentBaseX,
    y: state.contentBaseY,
    duration: 0.85,
    ease: "elastic.out(1.3, 0.28)",
    overwrite: true,
  });

  magneticStates.delete(element);
}

function getDistanceToRect(
  clientX: number,
  clientY: number,
  rect: DOMRect
) {
  const closestX = Math.max(rect.left, Math.min(clientX, rect.right));
  const closestY = Math.max(rect.top, Math.min(clientY, rect.bottom));

  return Math.hypot(clientX - closestX, clientY - closestY);
}

function updateMagnetic(
  element: HTMLElement,
  clientX: number,
  clientY: number,
  distance: number
) {
  initializeMagnetic(element);

  const state = magneticStates.get(element);

  if (!state) return;

  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const proximity = Math.max(0, 1 - distance / magneticField);
  const directionX = clientX - centerX;
  const directionY = clientY - centerY;
  const clamp = gsap.utils.clamp;

  state.buttonX(
    state.baseX + clamp(-14, 14)(directionX * 0.18 * proximity)
  );
  state.buttonY(
    state.baseY + clamp(-8, 8)(directionY * 0.18 * proximity)
  );
  state.contentX(
    state.contentBaseX + clamp(-8, 8)(directionX * 0.11 * proximity)
  );
  state.contentY(
    state.contentBaseY + clamp(-5, 5)(directionY * 0.11 * proximity)
  );
}

function findClosestButton(clientX: number, clientY: number) {
  let closestElement: HTMLElement | null = null;
  let closestDistance = magneticField;

  magneticElements.forEach((element) => {
    if (
      !element.isConnected ||
      element.matches(":disabled, [aria-disabled='true']")
    ) {
      return;
    }

    const distance = getDistanceToRect(
      clientX,
      clientY,
      element.getBoundingClientRect()
    );

    if (distance <= closestDistance) {
      closestDistance = distance;
      closestElement = element;
    }
  });

  return closestElement
    ? { element: closestElement, distance: closestDistance }
    : null;
}

function handleGlobalPointerMove(event: PointerEvent) {
  if (event.pointerType !== "mouse" || !supportsMagnetic()) {
    if (activeMagneticElement) {
      releaseMagnetic(activeMagneticElement);
      activeMagneticElement = null;
    }

    return;
  }

  const candidate = findClosestButton(event.clientX, event.clientY);

  if (activeMagneticElement !== candidate?.element) {
    if (activeMagneticElement) {
      releaseMagnetic(activeMagneticElement);
    }

    activeMagneticElement = candidate?.element ?? null;
  }

  if (candidate) {
    updateMagnetic(
      candidate.element,
      event.clientX,
      event.clientY,
      candidate.distance
    );
  }
}

function handlePointerOut(event: PointerEvent) {
  if (!event.relatedTarget && activeMagneticElement) {
    releaseMagnetic(activeMagneticElement);
    activeMagneticElement = null;
  }
}

function handleWindowBlur() {
  if (activeMagneticElement) {
    releaseMagnetic(activeMagneticElement);
    activeMagneticElement = null;
  }
}

function registerMagnetic(element: HTMLElement) {
  if (!supportsMagnetic()) return;

  const content = element.querySelector<HTMLElement>(
    `.${styles["button-content"]}`
  );

  if (!content) return;

  magneticElements.add(element);

  if (!pointerListenerAttached) {
    window.addEventListener("pointermove", handleGlobalPointerMove, {
      passive: true,
    });
    window.addEventListener("pointerout", handlePointerOut);
    window.addEventListener("blur", handleWindowBlur);

    pointerListenerAttached = true;
  }
}

function unregisterMagnetic(element: HTMLElement) {
  magneticElements.delete(element);

  if (activeMagneticElement === element) {
    releaseMagnetic(element);
    activeMagneticElement = null;
  }

  const state = magneticStates.get(element);

  if (state) {
    gsap.killTweensOf(element);
    gsap.killTweensOf(state.content);
    magneticStates.delete(element);
  }

  if (magneticElements.size === 0 && pointerListenerAttached) {
    window.removeEventListener("pointermove", handleGlobalPointerMove);
    window.removeEventListener("pointerout", handlePointerOut);
    window.removeEventListener("blur", handleWindowBlur);

    pointerListenerAttached = false;
  }
}

function getButtonClasses(
  variant: ButtonVariant,
  theme: ButtonTheme,
  size: ButtonSize,
  iconOnly: boolean,
  className?: string
) {
  const variants = {
    primary: styles["button-primary"],
    secondary: styles["button-secondary"],
    tertiary: styles["button-tertiary"],
  };

  const themes = {
    lime: styles["button-theme-lime"],
    light: styles["button-theme-light"],
    dark: styles["button-theme-dark"],
  };

  const sizes = {
    sm: styles["button-sm"],
    md: styles["button-md"],
    lg: styles["button-lg"],
  };

  return [
    styles.button,
    variants[variant],
    themes[theme],
    sizes[size],
    iconOnly ? styles["button-icon-only"] : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

function setRevealOrigin(
  element: HTMLElement,
  clientX: number,
  clientY: number
) {
  const rect = element.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const radius =
    Math.hypot(
      Math.max(x, rect.width - x),
      Math.max(y, rect.height - y)
    ) + 2;

  element.style.setProperty("--button-pointer-x", `${x}px`);
  element.style.setProperty("--button-pointer-y", `${y}px`);
  element.style.setProperty("--button-reveal-radius", `${radius}px`);
}

function ButtonContent({
  icon,
  iconPosition,
  children,
}: ButtonContentViewProps) {
  const iconElement = icon ? (
    <span className={styles["button-icon"]} aria-hidden="true">
      {icon}
    </span>
  ) : null;

  return (
    <span className={styles["button-content"]}>
      {iconPosition === "start" && iconElement}
      {children != null && (
        <span className={styles["button-label"]}>{children}</span>
      )}
      {iconPosition === "end" && iconElement}
    </span>
  );
}

export function Button({
  variant = "primary",
  theme = "lime",
  size = "md",
  icon,
  iconPosition = "end",
  className,
  children,
  type = "button",
  "aria-label": ariaLabel,
  onPointerEnter,
  onPointerMove,
  ...props
}: ButtonProps) {
  const iconOnly = children == null && Boolean(icon);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const element = buttonRef.current;

    if (!element) return;

    registerMagnetic(element);

    return () => unregisterMagnetic(element);
  }, []);

  return (
    <button
      ref={buttonRef}
      type={type}
      className={getButtonClasses(
        variant,
        theme,
        size,
        iconOnly,
        className
      )}
      aria-label={ariaLabel}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          setRevealOrigin(event.currentTarget, event.clientX, event.clientY);
        }

        onPointerEnter?.(event);
      }}
      onPointerMove={(event) => {
        if (event.pointerType === "mouse") {
          setRevealOrigin(event.currentTarget, event.clientX, event.clientY);
        }

        onPointerMove?.(event);
      }}
      {...props}
    >
      <ButtonContent icon={icon} iconPosition={iconPosition}>
        {children}
      </ButtonContent>
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  theme = "lime",
  size = "md",
  icon,
  iconPosition = "end",
  className,
  children,
  "aria-label": ariaLabel,
  onPointerEnter,
  onPointerMove,
  ...props
}: ButtonLinkProps) {
  const iconOnly = children == null && Boolean(icon);
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const element = linkRef.current;

    if (!element) return;

    registerMagnetic(element);

    return () => unregisterMagnetic(element);
  }, []);

  return (
    <Link
      ref={linkRef}
      href={href}
      className={getButtonClasses(
        variant,
        theme,
        size,
        iconOnly,
        className
      )}
      aria-label={ariaLabel}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          setRevealOrigin(event.currentTarget, event.clientX, event.clientY);
        }

        onPointerEnter?.(event);
      }}
      onPointerMove={(event) => {
        if (event.pointerType === "mouse") {
          setRevealOrigin(event.currentTarget, event.clientX, event.clientY);
        }

        onPointerMove?.(event);
      }}
      {...props}
    >
      <ButtonContent icon={icon} iconPosition={iconPosition}>
        {children}
      </ButtonContent>
    </Link>
  );
}
