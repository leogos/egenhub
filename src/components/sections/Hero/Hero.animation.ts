
"use client";

import { useEffect, type RefObject } from "react";

type Particle = {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
  speed: number;
  tone: number;
  rotates: boolean;
  orbitRadius: number;
  rotationSpeed: number;
};

const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

const mixColor = (
  start: number[],
  end: number[],
  progress: number
) =>
  start.map((value, index) =>
    Math.round(value + (end[index] - value) * progress)
  );

export function useHeroGalaxy(
  heroRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>
) {
  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!hero || !canvas || !ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const particles: Particle[] = [];
    const particleSprites: HTMLCanvasElement[][] = [[], []];

    const pointer = {
      x: 0,
      y: 0,
      active: false,
    };

    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let radiusX = 0;
    let radiusY = 0;
    let frame = 0;
    let visible = true;

    const innerRadius = 105;
    const outerRadius = 310;

    const createParticleSprites = () => {
      const palettes = [
        [148, 124, 224],
        [205, 225, 255],
      ];

      const violet = [139, 117, 255];
      const lime = [183, 255, 60];

      palettes.forEach((base, paletteIndex) => {
        for (let step = 0; step <= 32; step++) {
          const progress = step / 32;

          const color =
            progress <= 0.5
              ? mixColor(base, violet, progress * 2)
              : mixColor(violet, lime, (progress - 0.5) * 2);

          const sprite = document.createElement("canvas");
          sprite.width = 64;
          sprite.height = 64;

          const spriteCtx = sprite.getContext("2d");

          if (!spriteCtx) continue;

          const gradient = spriteCtx.createRadialGradient(
            32,
            32,
            0,
            32,
            32,
            31
          );

          gradient.addColorStop(
            0,
            `rgba(255, 255, 255, 0.48)`
          );
          gradient.addColorStop(
            0.12,
            `rgba(${color.join(", ")}, 0.96)`
          );
          gradient.addColorStop(
            0.34,
            `rgba(${color.join(", ")}, 0.76)`
          );
          gradient.addColorStop(
            0.62,
            `rgba(${color.join(", ")}, 0.32)`
          );
          gradient.addColorStop(
            0.86,
            `rgba(${color.join(", ")}, 0.08)`
          );
          gradient.addColorStop(
            1,
            `rgba(${color.join(", ")}, 0)`
          );

          spriteCtx.fillStyle = gradient;
          spriteCtx.fillRect(0, 0, 64, 64);

          particleSprites[paletteIndex][step] = sprite;
        }
      });
    };

    createParticleSprites();

    const drawGlow = (
      x: number,
      y: number,
      radius: number,
      color: string,
      opacity: number
    ) => {
      const gradient = ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        radius
      );

      gradient.addColorStop(0, `rgba(${color}, ${opacity})`);
      gradient.addColorStop(0.35, `rgba(${color}, ${opacity * 0.35})`);
      gradient.addColorStop(1, `rgba(${color}, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(
        x - radius,
        y - radius,
        radius * 2,
        radius * 2
      );
    };

    const createParticles = () => {
      particles.length = 0;

      centerX = width * (width < 640 ? 0.56 : 0.68);
      centerY = height * 0.52;

      radiusX = Math.min(width * 0.36, 540);
      radiusY = Math.min(height * 0.43, 300);

      const count = Math.min(
        1250,
        Math.max(380, Math.floor((width * height) / 900))
      );

      for (let i = 0; i < count; i++) {
        let x: number;
        let y: number;
        let orbitRadius = 1;
        let rotates = false;

        if (i < count * 0.84) {
          const radius = Math.pow(Math.random(), 0.88);
          const arm = i % 4;
          const angle =
            arm * Math.PI * 0.5 +
            radius * 5.8 +
            (Math.random() - 0.5) * 0.95;

          const spread = 0.04 + (1 - radius) * 0.08;

          x =
            centerX +
            Math.cos(angle) * radiusX * radius +
            (Math.random() - 0.5) * radiusX * spread;

          y =
            centerY +
            Math.sin(angle) * radiusY * radius +
            (Math.random() - 0.5) * radiusY * spread;

          orbitRadius = radius;
          rotates = true;
        } else {
          x = Math.random() * width;
          y = Math.random() * height;
        }

        particles.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: 0,
          vy: 0,
          size: 0.35 + Math.pow(Math.random(), 2) * 2,
          alpha: 0.28 + Math.random() * 0.68,
          phase: Math.random() * Math.PI * 2,
          speed: 0.45 + Math.random() * 1.5,
          tone: Math.random(),
          rotates,
          orbitRadius,
          rotationSpeed:
            0.035 + (1 - orbitRadius) * 0.10 + Math.random() * 0.006,
        });
      }
    };

    const draw = (time: number) => {
      frame = 0;

      if (!visible) return;

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      drawGlow(
        centerX,
        centerY,
        Math.max(radiusX, radiusY) * 0.85,
        "104, 75, 190",
        0.12
      );

      drawGlow(
        centerX,
        centerY,
        Math.max(radiusX, radiusY) * 0.48,
        "139, 117, 255",
        0.12
      );

      drawGlow(centerX, centerY, 105, "166, 132, 255", 0.32);
      drawGlow(centerX, centerY, 38, "220, 208, 255", 0.65);
      drawGlow(centerX, centerY, 12, "255, 255, 255", 0.9);

      if (pointer.active) {
        drawGlow(
          pointer.x,
          pointer.y,
          outerRadius,
          "139, 117, 255",
          0.2
        );

        drawGlow(
          pointer.x,
          pointer.y,
          innerRadius,
          "183, 255, 60",
          0.25
        );
      }

      for (const particle of particles) {
        let orbitX = particle.baseX;
        let orbitY = particle.baseY;

        if (particle.rotates && !reducedMotion) {
          const angle = time * particle.rotationSpeed * 0.001;
          const offsetX = particle.baseX - centerX;
          const offsetY = particle.baseY - centerY;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);

          orbitX = centerX + offsetX * cos - offsetY * sin;
          orbitY = centerY + offsetX * sin + offsetY * cos;
        }

        const dx = pointer.x - orbitX;
        const dy = pointer.y - orbitY;
        const distance = Math.hypot(dx, dy);

        let targetX =
          orbitX +
          Math.sin(time * 0.00015 + particle.phase) * 0.7;

        let targetY =
          orbitY +
          Math.cos(time * 0.00015 + particle.phase) * 0.7;

        let influence = 0;

        if (pointer.active && distance < outerRadius && distance > 0) {
          influence = 1 - smooth(distance / outerRadius);

          const pull = 42 * influence;
          const swirl = 24 * influence * influence;

          targetX += (dx / distance) * pull;
          targetY += (dy / distance) * pull;

          targetX -= (dy / distance) * swirl;
          targetY += (dx / distance) * swirl;
        }

        particle.vx =
          (particle.vx + (targetX - particle.x) * 0.075) * 0.84;

        particle.vy =
          (particle.vy + (targetY - particle.y) * 0.075) * 0.84;

        particle.x += particle.vx;
        particle.y += particle.vy;

        const mouseDistance = pointer.active
          ? Math.hypot(pointer.x - particle.x, pointer.y - particle.y)
          : Infinity;

        const inner = 1 - smooth(mouseDistance / innerRadius);
        const outer = 1 - smooth(mouseDistance / outerRadius);

        const paletteProgress =
          inner > 0
            ? 0.5 + inner * 0.5
            : outer * 0.5;

        const paletteIndex = Math.round(paletteProgress * 32);
        const palette = particle.tone > 0.78 ? 1 : 0;
        const sprite = particleSprites[palette][paletteIndex];

        const twinkle = reducedMotion
          ? 0.85
          : 0.72 +
            Math.sin(time * 0.001 * particle.speed + particle.phase) *
              0.28;

        const alpha = particle.alpha * twinkle;
        const radius = Math.max(2.4, particle.size * 3.4);

        if (sprite) {
          ctx.globalAlpha = alpha;
          ctx.drawImage(
            sprite,
            particle.x - radius,
            particle.y - radius,
            radius * 2,
            radius * 2
          );
        }
      }

      ctx.restore();
      ctx.globalAlpha = 1;

      if (!reducedMotion) {
        frame = window.requestAnimationFrame(draw);
      }
    };

    const schedule = () => {
      if (visible && !frame) {
        frame = window.requestAnimationFrame(draw);
      }
    };

    const resize = () => {
      const rect = hero.getBoundingClientRect();

      width = rect.width;
      height = rect.height;

      if (!width || !height) return;

      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      createParticles();
      schedule();
    };

    const movePointer = (event: PointerEvent) => {
      if (reducedMotion || event.pointerType !== "mouse") return;

      const rect = hero.getBoundingClientRect();

      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;

      schedule();
    };

    const leavePointer = () => {
      pointer.active = false;
      schedule();
    };

    const resizeObserver = new ResizeObserver(resize);

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;

      if (visible) {
        schedule();
      } else if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    });

    const visibilityChange = () => {
      if (document.hidden) {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
      } else {
        schedule();
      }
    };

    resizeObserver.observe(hero);
    visibilityObserver.observe(hero);

    hero.addEventListener("pointermove", movePointer, { passive: true });
    hero.addEventListener("pointerleave", leavePointer);
    window.addEventListener("blur", leavePointer);
    document.addEventListener("visibilitychange", visibilityChange);

    resize();

    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();

      hero.removeEventListener("pointermove", movePointer);
      hero.removeEventListener("pointerleave", leavePointer);
      window.removeEventListener("blur", leavePointer);
      document.removeEventListener("visibilitychange", visibilityChange);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [heroRef, canvasRef]);
}
