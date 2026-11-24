"use client";

import { useEffect, type RefObject } from "react";

type Particle = {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  phase: number;
  orbit: number;
};

export function useFeaturedCounters(
  sectionRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const stats = Array.from(
      section.querySelectorAll<HTMLElement>("[data-featured-stat]")
    );

    const activeFrames = new Set<number>();
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const setFinalValue = (element: HTMLElement) => {
      const target = Number(element.dataset.target);
      const suffix = element.dataset.suffix ?? "";

      if (Number.isFinite(target)) {
        element.textContent = `${target}${suffix}`;
      }
    };

    const animateCounter = (element: HTMLElement) => {
      const target = Number(element.dataset.target);
      const suffix = element.dataset.suffix ?? "";

      if (!Number.isFinite(target)) return;

      if (reducedMotion) {
        setFinalValue(element);
        return;
      }

      const duration = 1600;
      let startTime: number | null = null;
      let frameId = 0;

      const update = (time: number) => {
        activeFrames.delete(frameId);

        if (startTime === null) startTime = time;

        const progress = Math.min((time - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(target * eased);

        element.textContent = `${progress === 1 ? target : current}${suffix}`;

        if (progress < 1) {
          frameId = window.requestAnimationFrame(update);
          activeFrames.add(frameId);
        }
      };

      frameId = window.requestAnimationFrame(update);
      activeFrames.add(frameId);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const stat = entry.target as HTMLElement;
          stat.setAttribute("data-visible", "true");

          const counter = stat.querySelector<HTMLElement>("[data-counter]");

          if (counter) animateCounter(counter);

          observer.unobserve(stat);
        });
      },
      {
        threshold: 0.35,
        rootMargin: "0px 0px -5% 0px",
      }
    );

    if (reducedMotion || !("IntersectionObserver" in window)) {
      stats.forEach((stat) => {
        stat.setAttribute("data-visible", "true");

        const counter = stat.querySelector<HTMLElement>("[data-counter]");
        if (counter) setFinalValue(counter);
      });
    } else {
      stats.forEach((stat) => observer.observe(stat));
    }

    return () => {
      observer.disconnect();

      activeFrames.forEach((frame) => {
        window.cancelAnimationFrame(frame);
      });

      activeFrames.clear();
    };
  }, [sectionRef]);
}

export function useFeaturedParticles(
  sectionRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>
) {
  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!section || !canvas || !context) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const lime = "#B7FF3C";
    const violet = "#8B75FF";

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let isVisible = false;
    let pointerX = -1000;
    let pointerY = -1000;
    let rotation = 0;
    let particles: Particle[] = [];

    const createParticles = () => {
      const count = Math.min(
        240,
        Math.max(90, Math.floor((width * height) / 6500))
      );

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: Math.random(),
        size: Math.random() * 1.5 + 0.45,
        speed: Math.random() * 0.0008 + 0.0002,
        phase: Math.random() * Math.PI * 2,
        orbit: Math.random() * 0.025 + 0.008,
      }));
    };

    const resize = () => {
      const rect = section.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      createParticles();
      draw();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const pointerActive =
        pointerX > 0 &&
        pointerY > 0 &&
        pointerX < width &&
        pointerY < height;

      particles.forEach((particle, index) => {
        const angle =
          rotation * (0.25 + particle.speed * 150) + particle.phase;

        const orbitX =
          particle.x * Math.cos(angle) -
          particle.y * Math.sin(angle) * 0.72;

        const orbitY =
          particle.x * Math.sin(angle) * 0.72 +
          particle.y * Math.cos(angle);

        let x = centerX + orbitX * width * 0.48;
        let y = centerY + orbitY * height * 0.48;

        const dx = pointerX - x;
        const dy = pointerY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influence = pointerActive
          ? Math.max(0, 1 - distance / 190)
          : 0;

        x += dx * influence * 0.12;
        y += dy * influence * 0.12;

        const perspective = 0.35 + particle.z * 0.9;
        const radius = particle.size * perspective;
        const alpha = 0.18 + particle.z * 0.58;
        const color = index % 5 === 0 ? violet : lime;

        context.beginPath();
        context.fillStyle = color;
        context.globalAlpha = alpha;
        context.shadowColor = color;
        context.shadowBlur = particle.z * 12 + influence * 10;
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      });

      context.globalAlpha = 1;
      context.shadowBlur = 0;
    };

    const animate = () => {
      if (!isVisible) return;

      rotation += 0.0014;

      if (!reducedMotion) {
        draw();
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect();

      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;

      if (reducedMotion) draw();
    };

    const handlePointerLeave = () => {
      pointerX = -1000;
      pointerY = -1000;

      if (reducedMotion) draw();
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;

        window.cancelAnimationFrame(animationFrame);

        if (isVisible && !reducedMotion) {
          animate();
        }
      },
      { threshold: 0 }
    );

    const resizeObserver = new ResizeObserver(resize);

    resizeObserver.observe(section);
    visibilityObserver.observe(section);

    section.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    section.addEventListener("pointerleave", handlePointerLeave);

    resize();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      section.removeEventListener("pointermove", handlePointerMove);
      section.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [sectionRef, canvasRef]);
}
