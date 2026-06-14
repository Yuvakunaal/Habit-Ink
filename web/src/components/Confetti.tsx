import React, { useEffect, useRef } from "react";
import { useColors } from "@/hooks/useColors";

interface Particle {
  x: number; y: number; vx: number; vy: number; gravity: number;
  color: string; w: number; h: number; rotation: number; vr: number; alpha: number;
}

export function Confetti({ active, onDone }: { active: boolean; onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = useColors();
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const palette = [colors.primary, colors.success, colors.accent, colors.secondary, "#F4C430", "#E88A3F", "#A855F7"];

    const particles: Particle[] = Array.from({ length: 180 }).map(() => ({
      x: Math.random() * W,
      y: -20 - Math.random() * 250,
      vx: (Math.random() - 0.5) * 7,
      vy: 2.5 + Math.random() * 4.5,
      gravity: 0.07 + Math.random() * 0.06,
      color: palette[Math.floor(Math.random() * palette.length)],
      w: 7 + Math.random() * 10,
      h: 3 + Math.random() * 5,
      rotation: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.18,
      alpha: 1,
    }));

    let frame = 0;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;
      let anyVisible = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.992;
        p.rotation += p.vr;
        if (frame > 55) p.alpha = Math.max(0, p.alpha - 0.013);
        if (p.alpha > 0 && p.y < H + 30) anyVisible = true;
        if (p.alpha <= 0) continue;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (!anyVisible && frame > 30) { onDone(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }} />;
}
