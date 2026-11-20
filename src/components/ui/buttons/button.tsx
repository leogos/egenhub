"use client";

import Link from "next/link";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

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

type MagneticBase = {
  buttonX: number;
  buttonY: number;
  contentX: number;
  contentY: number;
  content: HTMLElement;
};

type MagneticState = {
  buttonX: (value: number) => void;
  buttonY: (value: number) => void;
  contentX: (value: number) => void;
  contentY: (value: number) => void;
  base: MagneticBase;
};

type ButtonRect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
};

const magneticField = 36;
const magneticElements = new Set<HTMLElement>();
const magneticBases = new WeakMap<HTMLElement, MagneticBase>();
const magneticStates = new WeakMap<HTMLElement, MagneticState>();

let activeMagneticElement: HTMLElement | null = null;
let pointerListenerAttached = false;

let hoverQuery: MediaQueryList | null = null;
let reducedMotionQuery: MediaQueryList | null = null;

function supportsMagnetic() {
  if (typeof window === "undefined") return false;

  hoverQuery ??= window.matchMedia("(hover: hover) and (pointer: fine)");
  reducedMotionQuery ??= window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  return hoverQuery.matches && !reducedMotionQuery.matches;
}

function getTransformValue(element: HTMLElement, axis: "x" | "y") {
  const value = gsap.getProperty(element, axis);
  const parsed =
    typeof value === "number" ? value : Number.parseFloat(String(value));

  return Number.isFinite(parsed) ? parsed : 0;
}

function getButtonRect(element: HTMLElement): ButtonRect | null {
  const base = magneticBases.get(element);

  if (!base) return null;

  const rect = element.getBoundingClientRect();
  const offsetX = getTransformValue(element, "x") - base.buttonX;
  const offsetY = getTransformValue(element, "y") - base.buttonY;

  const left = rect.left - offsetX;
  const top = rect.top - offsetY;

  return {
    left,
    right: left + rect.width,
    top,
    bottom: top + rect.height,
    width: rect.width,
    height: rect.height,
  };
}

function getDistanceToRect(
  clientX: number,
  clientY: number,
  rect: ButtonRect
) {
  const closestX = Math.max(rect.left, Math.min(clientX, rect.right));
  const closestY = Math.max(rect.top, Math.min(clientY, rect.bottom));

  return Math.hypot(clientX - closestX, clientY - closestY);
}

function initializeMagnetic(element: HTMLElement) {
  if (magneticStates.has(element)) return;

  const base = magneticBases.get(element);

  if (!base) return;

  gsap.killTweensOf(element);
  gsap.killTweensOf(base.content);

  const state: MagneticState = {
    base,
    buttonX: gsap.quickTo(element, "x", {
      duration: 0.3,
      ease: "power3.out",
      overwrite: "auto",
    }),
    buttonY: gsap.quickTo(element, "y", {
      duration: 0.3,
      ease: "power3.out",
      overwrite: "auto",
    }),
    contentX: gsap.quickTo(base.content, "x", {
      duration: 0.25,
      ease: "power3.out",
      overwrite: "auto",
    }),
    contentY: gsap.quickTo(base.content, "y", {
      duration: 0.25,
      ease: "power3.out",
      overwrite: "auto",
    }),
  };

  magneticStates.set(element, state);
}

function updateMagnetic(
  element: HTMLElement,
  clientX: number,
  clientY: number,
  distance: number
) {
  initializeMagnetic(element);

  const state = magneticStates.get(element);
  const rect = getButtonRect(element);

  if (!state || !rect) return;

  const proximity = Math.max(0, 1 - distance / magneticField);
  const directionX = clientX - (rect.left + rect.width / 2);
  const directionY = clientY - (rect.top + rect.height / 2);

  const clamp = gsap.utils.clamp;

  const buttonOffsetX = clamp(-14, 14)(
    directionX * 0.18 * proximity
  );

  const buttonOffsetY = clamp(-8, 8)(
    directionY * 0.18 * proximity
  );

  const contentOffsetX = clamp(-8, 8)(
    directionX * 0.11 * proximity
  );

  const contentOffsetY = clamp(-5, 5)(
    directionY * 0.11 * proximity
  );

  state.buttonX(state.base.buttonX + buttonOffsetX);
  state.buttonY(state.base.buttonY + buttonOffsetY);
  state.contentX(state.base.contentX + contentOffsetX);
  state.contentY(state.base.contentY + contentOffsetY);
}

function releaseMagnetic(element: HTMLElement) {
  const state = magneticStates.get(element);

  if (!state) return;

  gsap.killTweensOf(element);
  gsap.killTweensOf(state.base.content);

  gsap.to(element, {
    x: state.base.buttonX,
    y: state.base.buttonY,
    duration: 0.85,
    ease: "elastic.out(1.3, 0.28)",
    overwrite: true,
  });

  gsap.to(state.base.content, {
    x: state.base.contentX,
    y: state.base.contentY,
    duration: 0.85,
    ease: "elastic.out(1.3, 0.28)",
    overwrite: true,
  });

  magneticStates.delete(element);
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

    const rect = getButtonRect(element);

    if (!rect) return;

    const distance = getDistanceToRect(clientX, clientY, rect);

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
  const content = element.querySelector<HTMLElement>(".button__content");

  if (!content) return;

  magneticBases.set(element, {
    buttonX: getTransformValue(element, "x"),
    buttonY: getTransformValue(element, "y"),
    contentX: getTransformValue(content, "x"),
    contentY: getTransformValue(content, "y"),
    content,
  });

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
    activeMagneticElement = null;
  }

  const base = magneticBases.get(element);

  gsap.killTweensOf(element);

  if (base) {
    gsap.killTweensOf(base.content);
  }

  magneticStates.delete(element);
  magneticBases.delete(element);

  if (magneticElements.size === 0 && pointerListenerAttached) {
    window.removeEventListener("pointermove", handleGlobalPointerMove);
    window.removeEventListener("pointerout", handlePointerOut);
    window.removeEventListener("blur", handleWindowBlur);

    pointerListenerAttached = false;
  }
}

function useMagneticRef<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    registerMagnetic(element);

    return () => unregisterMagnetic(element);
  }, []);

  return ref;
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

function getButtonClassName(
  variant: ButtonVariant,
  theme: ButtonTheme,
  size: ButtonSize,
  iconOnly: boolean,
  className?: string
) {
  return [
    "button",
    `button--${variant}`,
    `button--theme-${theme}`,
    `button--${size}`,
    iconOnly && "button--icon-only",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

function ButtonContent({
  icon,
  iconPosition,
  children,
}: ButtonContentViewProps) {
  const iconElement = icon ? (
    <span className="button__icon" aria-hidden="true">
      {icon}
    </span>
  ) : null;

  return (
    <span className="button__content">
      {iconPosition === "start" && iconElement}
      {children != null && (
        <span className="button__label">{children}</span>
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
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  ...props
}: ButtonProps) {
  const iconOnly = children == null && Boolean(icon);
  const magneticRef = useMagneticRef<HTMLButtonElement>();

  return (
    <button
      ref={magneticRef}
      type={type}
      className={getButtonClassName(
        variant,
        theme,
        size,
        iconOnly,
        className
      )}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          setRevealOrigin(
            event.currentTarget,
            event.clientX,
            event.clientY
          );
        }

        onPointerEnter?.(event);
      }}
      onPointerMove={(event) => {
        if (event.pointerType === "mouse") {
          setRevealOrigin(
            event.currentTarget,
            event.clientX,
            event.clientY
          );
        }

        onPointerMove?.(event);
      }}
      onPointerLeave={onPointerLeave}
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
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  ...props
}: ButtonLinkProps) {
  const iconOnly = children == null && Boolean(icon);
  const magneticRef = useMagneticRef<HTMLAnchorElement>();

  return (
    <Link
      ref={magneticRef}
      href={href}
      className={getButtonClassName(
        variant,
        theme,
        size,
        iconOnly,
        className
      )}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          setRevealOrigin(
            event.currentTarget,
            event.clientX,
            event.clientY
          );
        }

        onPointerEnter?.(event);
      }}
      onPointerMove={(event) => {
        if (event.pointerType === "mouse") {
          setRevealOrigin(
            event.currentTarget,
            event.clientX,
            event.clientY
          );
        }

        onPointerMove?.(event);
      }}
      onPointerLeave={onPointerLeave}
      {...props}
    >
      <ButtonContent icon={icon} iconPosition={iconPosition}>
        {children}
      </ButtonContent>
    </Link>
  );
}
