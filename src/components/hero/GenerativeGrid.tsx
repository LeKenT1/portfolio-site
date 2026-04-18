"use client";

import { useEffect, useRef, useCallback } from "react";

interface Dot {
  bx: number; by: number;
  x: number;  y: number;
  vx: number; vy: number;
  baseOpacity: number;
  opacity: number;
  size: number;
}

interface ChipDef {
  label: string;
  desc:  string;
  bx: number;
  by: number;
  phase: number;
}

interface ChipPhysics { x: number; y: number; vx: number; vy: number; }

type ChipMeta = {
  chip: ChipDef;
  cx: number; cy: number; bw: number; bh: number; bx: number; by: number;
  glow: number; index: number; chipPushR: number;
};

const CHIPS: ChipDef[] = [
  { label: "React",      desc: "UI component library",    bx: 0.25, by: 0.22, phase: 0.0 },
  { label: "Next.js",    desc: "React framework & SSR",   bx: 0.68, by: 0.18, phase: 1.1 },
  { label: "TypeScript", desc: "Typed JavaScript",        bx: 0.55, by: 0.46, phase: 2.3 },
  { label: "Node.js",    desc: "Server-side runtime",     bx: 0.20, by: 0.58, phase: 0.7 },
  { label: "Docker",     desc: "Containers & deployment", bx: 0.72, by: 0.60, phase: 1.8 },
  { label: "PostgreSQL", desc: "Relational database",     bx: 0.38, by: 0.80, phase: 3.1 },
  { label: "Tailwind",   desc: "Utility-first CSS",       bx: 0.74, by: 0.82, phase: 2.0 },
];

const ACCENT           = [200, 169, 126] as const;
const INFLUENCE_RADIUS = 120;
const CONNECT_RADIUS   = 100;
const LINE_MAX_DIST    = 60;
const CHIP_HOVER_R     = 70;
const PUSH_RADIUS      = 90;
const PUSH_STRENGTH    = 2.8;
const SPRING_K         = 0.055;
const DAMPING          = 0.82;
const CHIP_SPRING_K    = 0.04;
const CHIP_DAMPING     = 0.88;
const PULL_STRENGTH    = 0.55;
const CHIP_FONT        = "12px 'Courier New', monospace";
const CHIP_PAD_X       = 12;
const CHIP_H           = 28;
const TRANSITION_MS    = 2200;

interface Props { onAllActivated?: () => void; }

export function GenerativeGrid({ onAllActivated }: Props) {
  const canvasRef             = useRef<HTMLCanvasElement>(null);
  const mouseRef              = useRef({ x: -1000, y: -1000 });
  const dotsRef               = useRef<Dot[]>([]);
  const chipPhysRef           = useRef<ChipPhysics[]>([]);
  const rafRef                = useRef<number>(0);
  const startTimeRef          = useRef<number>(0);
  const isDraggingRef         = useRef(false);
  const dragStartRef          = useRef(0);
  const dragOriginRef         = useRef({ x: -1000, y: -1000 });
  const activatedRef          = useRef<Set<number>>(new Set());
  const chipMetasRef          = useRef<ChipMeta[]>([]);
  const pendingActivationRef  = useRef(-1);
  const transitionRef         = useRef<{ t0: number; called: boolean } | null>(null);
  const onAllActivatedRef     = useRef(onAllActivated);

  useEffect(() => { onAllActivatedRef.current = onAllActivated; }, [onAllActivated]);

  const buildGrid = useCallback((canvas: HTMLCanvasElement) => {
    const gap  = 28;
    const cols = Math.ceil(canvas.width  / gap) + 1;
    const rows = Math.ceil(canvas.height / gap) + 1;
    const dots: Dot[] = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const bx = c * gap, by = r * gap;
        dots.push({ bx, by, x: bx, y: by, vx: 0, vy: 0, baseOpacity: 0.12 + Math.random() * 0.1, opacity: 0.12, size: 1 });
      }
    dotsRef.current = dots;
  }, []);

  const buildChips = useCallback((canvas: HTMLCanvasElement) => {
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    chipPhysRef.current = CHIPS.map(chip => ({ x: chip.bx * w, y: chip.by * h, vx: 0, vy: 0 }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    startTimeRef.current = Date.now();

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      buildGrid(canvas);
      buildChips(canvas);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const section = canvas.closest("section") as HTMLElement | null;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      mouseRef.current = { x, y };

      if (!isDraggingRef.current && !transitionRef.current) {
        const over = chipMetasRef.current.some(m => x >= m.bx && x <= m.bx + m.bw && y >= m.by && y <= m.by + m.bh);
        if (section) section.style.cursor = over ? "pointer" : "";
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (transitionRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;

      const chip = chipMetasRef.current.find(m => x >= m.bx && x <= m.bx + m.bw && y >= m.by && y <= m.by + m.bh);
      if (chip) { pendingActivationRef.current = chip.index; return; }

      isDraggingRef.current = true;
      dragStartRef.current  = Date.now();
      dragOriginRef.current = { x, y };
      if (section) section.style.cursor = "none";
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      if (!transitionRef.current && section) section.style.cursor = "";

      const idx = pendingActivationRef.current;
      if (idx >= 0) {
        pendingActivationRef.current = -1;
        if (activatedRef.current.has(idx)) activatedRef.current.delete(idx);
        else                                activatedRef.current.add(idx);

        if (activatedRef.current.size === CHIPS.length && !transitionRef.current) {
          transitionRef.current = { t0: Date.now(), called: false };
          if (section) section.style.cursor = "none";
        }
      }
    };

    section?.addEventListener("mousemove", handleMouseMove);
    section?.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup",     handleMouseUp);

    const render = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const now        = Date.now();
      const t          = (now - startTimeRef.current) / 1000;
      const isDragging = isDraggingRef.current;
      const trans      = transitionRef.current;
      const tx         = isDragging ? dragOriginRef.current.x : mouseRef.current.x;
      const ty         = isDragging ? dragOriginRef.current.y : mouseRef.current.y;
      const mx         = mouseRef.current.x;
      const my         = mouseRef.current.y;

      // ── 1. Chip physics ────────────────────────────────────────────────────
      ctx.font = CHIP_FONT;
      const chipMetas: ChipMeta[] = CHIPS.map((chip, i) => {
        const phys = chipPhysRef.current[i];
        if (!phys) return null as unknown as ChipMeta;
        phys.vx += (chip.bx * w - phys.x) * CHIP_SPRING_K;
        phys.vy += (chip.by * h - phys.y) * CHIP_SPRING_K;
        phys.vx *= CHIP_DAMPING; phys.vy *= CHIP_DAMPING;
        phys.x  += phys.vx;     phys.y  += phys.vy;

        const cx  = phys.x, cy = phys.y;
        const tw  = ctx.measureText(chip.label).width;
        const bw  = tw + CHIP_PAD_X * 2;
        const bx  = cx - bw / 2, by = cy - CHIP_H / 2;
        const ddx = cx - mx, ddy = cy - my;
        const glow = Math.pow(Math.max(0, 1 - Math.sqrt(ddx * ddx + ddy * ddy) / CHIP_HOVER_R), 2);
        return { chip, cx, cy, bw, bh: CHIP_H, bx, by, glow, index: i, chipPushR: Math.max(bw, CHIP_H) / 2 + 20 };
      }).filter(Boolean) as ChipMeta[];
      chipMetasRef.current = chipMetas;

      // ── TRANSITION phase ───────────────────────────────────────────────────
      if (trans) {
        const p = Math.min(1, (now - trans.t0) / TRANSITION_MS);

        // Dots collapse to canvas center at accelerating force
        for (const dot of dotsRef.current) {
          const dx = dot.x - w / 2, dy = dot.y - h / 2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 1) {
            const force = 1.5 + p * 10;
            dot.vx -= (dx / dist) * force;
            dot.vy -= (dy / dist) * force;
          }
          dot.vx *= 0.86; dot.vy *= 0.86;
          dot.x  += dot.vx; dot.y  += dot.vy;
        }

        // Draw dots
        for (const dot of dotsRef.current) {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${0.4 + p * 0.4})`;
          ctx.fill();
        }

        // Chips pulse and fade
        const pulse = Math.max(0, (0.5 + 0.5 * Math.sin(t * 18)) * (1 - p * 1.2));
        ctx.save(); ctx.font = CHIP_FONT;
        for (const m of chipMetas) {
          ctx.globalAlpha = pulse;
          ctx.fillStyle   = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
          ctx.fillRect(m.bx, m.by, m.bw, m.bh);
          ctx.globalAlpha = pulse;
          ctx.fillStyle   = "#060606";
          ctx.textAlign   = "center"; ctx.textBaseline = "middle";
          ctx.fillText(m.chip.label, m.cx, m.cy);
        }
        ctx.restore();

        // Fade to black
        if (p > 0.45) {
          const a = Math.min(1, (p - 0.45) / 0.55);
          ctx.fillStyle = `rgba(6,6,6,${a})`;
          ctx.fillRect(0, 0, w, h);
        }

        if (p >= 0.92 && !trans.called) {
          trans.called = true;
          onAllActivatedRef.current?.();
        }

        rafRef.current = requestAnimationFrame(render);
        return;
      }

      // ── 2. Dot density near each chip (for drag-reveal) ────────────────────
      const chipDotDensity = chipMetas.map(m => {
        const r2 = (Math.max(m.bw, m.bh) / 2 + 18) ** 2;
        let n = 0;
        for (const d of dotsRef.current) { const dx = d.x - m.cx, dy = d.y - m.cy; if (dx*dx+dy*dy < r2) n++; }
        return n;
      });

      // ── 3. Draw chips ──────────────────────────────────────────────────────
      ctx.save(); ctx.font = CHIP_FONT;
      for (const m of chipMetas) {
        const activated = activatedRef.current.has(m.index);
        const density   = chipDotDensity[m.index] ?? 0;
        const dragGlow  = isDragging ? Math.max(0, 1 - density / 3) : 0;
        const baseAlpha = Math.max(m.glow, dragGlow) * 0.9;

        if (activated) {
          // Filled activated state — bright fill, dark label
          ctx.globalAlpha = 0.92;
          ctx.fillStyle   = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
          ctx.fillRect(m.bx, m.by, m.bw, m.bh);

          ctx.globalAlpha = 1;
          ctx.strokeStyle = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
          ctx.lineWidth   = 1.5;
          ctx.strokeRect(m.bx, m.by, m.bw, m.bh);

          ctx.fillStyle    = "#080808";
          ctx.textAlign    = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(m.chip.label, m.cx, m.cy);

          // Small active indicator dot — top-right corner
          ctx.beginPath();
          ctx.arc(m.bx + m.bw - 5, m.by + 5, 2.5, 0, Math.PI * 2);
          ctx.fillStyle   = "#080808";
          ctx.globalAlpha = 0.7;
          ctx.fill();
          ctx.globalAlpha = 1;
        } else {
          ctx.globalAlpha = baseAlpha * 0.22;
          ctx.fillStyle   = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
          ctx.fillRect(m.bx, m.by, m.bw, m.bh);
          ctx.globalAlpha = baseAlpha * 0.55;
          ctx.strokeStyle = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
          ctx.lineWidth   = 0.5;
          ctx.strokeRect(m.bx, m.by, m.bw, m.bh);
          ctx.globalAlpha  = baseAlpha;
          ctx.fillStyle    = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
          ctx.textAlign    = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(m.chip.label, m.cx, m.cy);
        }
      }
      ctx.restore();

      // ── 4. Dot physics + draw ──────────────────────────────────────────────
      const nearDots: { x: number; y: number }[] = [];

      for (const dot of dotsRef.current) {
        const dxM = dot.x - mx, dyM = dot.y - my;
        const distM = Math.sqrt(dxM * dxM + dyM * dyM);
        const dxT = dot.x - tx, dyT = dot.y - ty;
        const distT = Math.sqrt(dxT * dxT + dyT * dyT);

        if (isDragging) {
          if (distT > 1) { dot.vx -= (dxT / distT) * PULL_STRENGTH; dot.vy -= (dyT / distT) * PULL_STRENGTH; }
        } else {
          if (distM < PUSH_RADIUS && distM > 0) {
            const f = (1 - distM / PUSH_RADIUS) * PUSH_STRENGTH;
            dot.vx += (dxM / distM) * f; dot.vy += (dyM / distM) * f;
          }
        }

        if (!isDragging) {
          for (const m of chipMetas) {
            if (m.glow <= 0) continue;
            const dxC = dot.x - m.cx, dyC = dot.y - m.cy;
            const distC = Math.sqrt(dxC * dxC + dyC * dyC);
            if (distC < m.chipPushR && distC > 0) {
              const f = (1 - distC / m.chipPushR) * PUSH_STRENGTH * m.glow * 3;
              dot.vx += (dxC / distC) * f; dot.vy += (dyC / distC) * f;
            }
          }
          dot.vx += (dot.bx - dot.x) * SPRING_K;
          dot.vy += (dot.by - dot.y) * SPRING_K;
        }
        dot.vx *= DAMPING; dot.vy *= DAMPING;
        dot.x  += dot.vx;  dot.y  += dot.vy;

        const dxI = dot.bx - mx, dyI = dot.by - my;
        const distI = Math.sqrt(dxI * dxI + dyI * dyI);
        const prox  = Math.max(0, 1 - distI / INFLUENCE_RADIUS);

        const target = isDragging ? dot.baseOpacity + 0.35 : dot.baseOpacity + prox * 0.65;
        dot.opacity += (target - dot.opacity) * 0.08;

        const r = Math.round(ACCENT[0] * prox + 240 * (1 - prox));
        const g = Math.round(ACCENT[1] * prox + 240 * (1 - prox));
        const b = Math.round(ACCENT[2] * prox + 240 * (1 - prox));

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size + prox * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${dot.opacity})`;
        ctx.fill();

        if (distI < CONNECT_RADIUS) nearDots.push({ x: dot.x, y: dot.y });
      }

      // ── 5. Constellation lines ─────────────────────────────────────────────
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nearDots.length; i++)
        for (let j = i + 1; j < nearDots.length; j++) {
          const a = nearDots[i], b = nearDots[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < LINE_MAX_DIST) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${(1 - d / LINE_MAX_DIST) * 0.35})`;
            ctx.stroke();
          }
        }

      // ── 6. Drag cursor ring ────────────────────────────────────────────────
      if (isDragging && mx > -500) {
        ctx.save();
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2 + t * 2;
          const cx = tx + Math.cos(angle) * 14, cy = ty + Math.sin(angle) * 14;
          ctx.beginPath(); ctx.arc(cx, cy, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${0.6 + 0.4 * Math.sin(t * 4 + (i / 10) * Math.PI * 2)})`;
          ctx.fill();
        }
        ctx.beginPath(); ctx.arc(tx, ty, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},1)`;
        ctx.fill();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      section?.removeEventListener("mousemove", handleMouseMove);
      section?.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup",     handleMouseUp);
    };
  }, [buildGrid, buildChips]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />;
}
