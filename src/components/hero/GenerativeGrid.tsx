"use client";

import { useEffect, useRef, useCallback } from "react";

interface Dot {
  bx: number;
  by: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseOpacity: number;
  opacity: number;
  size: number;
}

interface Ripple {
  x: number;
  y: number;
  startTime: number;
  triggered: Set<number>; // dot indices already hit by this wave
}

interface ChipDef {
  label: string;
  desc:  string;
  bx: number;
  by: number;
  phase: number;
}

interface ChipPhysics {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const CHIPS: ChipDef[] = [
  { label: "React",      desc: "UI component library",      bx: 0.25, by: 0.22, phase: 0.0 },
  { label: "Next.js",    desc: "React framework & SSR",     bx: 0.68, by: 0.18, phase: 1.1 },
  { label: "TypeScript", desc: "Typed JavaScript",          bx: 0.55, by: 0.46, phase: 2.3 },
  { label: "Node.js",    desc: "Server-side runtime",       bx: 0.20, by: 0.58, phase: 0.7 },
  { label: "Docker",     desc: "Containers & deployment",   bx: 0.72, by: 0.60, phase: 1.8 },
  { label: "PostgreSQL", desc: "Relational database",       bx: 0.38, by: 0.80, phase: 3.1 },
  { label: "Tailwind",   desc: "Utility-first CSS",         bx: 0.74, by: 0.82, phase: 2.0 },
];

const ACCENT           = [200, 169, 126] as const;
const INFLUENCE_RADIUS = 120;
const CONNECT_RADIUS   = 100;
const LINE_MAX_DIST    = 60;
const CHIP_HOVER_R     = 150;
const RIPPLE_DURATION  = 900;

// Dot physics
const PUSH_RADIUS   = 90;
const PUSH_STRENGTH = 2.8;
const SPRING_K      = 0.055;
const DAMPING       = 0.82;

// Chip physics
const CHIP_PUSH_R   = 120;
const CHIP_PUSH_STR = 3.5;
const CHIP_SPRING_K = 0.04;
const CHIP_DAMPING  = 0.88;
const CHIP_FLOAT_AMP = 4;

// Click impulse
const IMPULSE_RADIUS = 170;
const IMPULSE_STR    = 12;
const CHIP_IMPULSE_R = 200;
const CHIP_IMPULSE_STR = 6;

// Chip visual constants
const CHIP_FONT  = "12px 'Courier New', monospace";
const CHIP_PAD_X = 12;
const CHIP_H     = 28;

// Tooltip constants
const TT_W       = 168;
const TT_H       = 58;
const TT_PAD     = 13;
const TT_MARGIN  = 16;
const TT_FADE_MS = 180;

export function GenerativeGrid() {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const mouseRef       = useRef({ x: -1000, y: -1000 });
  const dotsRef        = useRef<Dot[]>([]);
  const chipPhysRef    = useRef<ChipPhysics[]>([]);
  const rafRef         = useRef<number>(0);
  const ripplesRef     = useRef<Ripple[]>([]);
  const startTimeRef   = useRef<number>(0);
  const hoveredRef     = useRef<number>(-1);
  const hoverStartRef  = useRef<number>(0);

  const buildGrid = useCallback((canvas: HTMLCanvasElement) => {
    const gap  = 28;
    const cols = Math.ceil(canvas.width  / gap) + 1;
    const rows = Math.ceil(canvas.height / gap) + 1;
    const dots: Dot[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const bx = c * gap;
        const by = r * gap;
        dots.push({
          bx, by,
          x: bx, y: by,
          vx: 0, vy: 0,
          baseOpacity: 0.12 + Math.random() * 0.1,
          opacity: 0.12,
          size: 1,
        });
      }
    }
    dotsRef.current = dots;
  }, []);

  const buildChips = useCallback((canvas: HTMLCanvasElement) => {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    chipPhysRef.current = CHIPS.map(chip => ({
      x: chip.bx * w,
      y: chip.by * h,
      vx: 0,
      vy: 0,
    }));
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

    const section = canvas.closest("section");

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      ripplesRef.current.push({ x: cx, y: cy, startTime: Date.now(), triggered: new Set() });
      if (ripplesRef.current.length > 6) ripplesRef.current.shift();

      // Chip impulse
      for (const phys of chipPhysRef.current) {
        const dx   = phys.x - cx;
        const dy   = phys.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CHIP_IMPULSE_R && dist > 0) {
          const force = (1 - dist / CHIP_IMPULSE_R) * CHIP_IMPULSE_STR;
          phys.vx += (dx / dist) * force;
          phys.vy += (dy / dist) * force;
        }
      }
    };

    section?.addEventListener("mousemove", handleMouseMove);
    section?.addEventListener("click",     handleClick);

    const render = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const mx  = mouseRef.current.x;
      const my  = mouseRef.current.y;
      const now = Date.now();
      const t   = (now - startTimeRef.current) / 1000;

      // ── 1. Update chip physics + compute metadata ──────────────────────────
      ctx.font = CHIP_FONT;
      const chipMetas = CHIPS.map((chip, i) => {
        const phys = chipPhysRef.current[i];
        if (!phys) return null;

        // Base position with gentle float
        const basX = chip.bx * w;
        const basY = chip.by * h + Math.sin(t * 0.55 + chip.phase) * CHIP_FLOAT_AMP;

        // Cursor repulsion
        const dxM = phys.x - mx;
        const dyM = phys.y - my;
        const distM = Math.sqrt(dxM * dxM + dyM * dyM);
        if (distM < CHIP_PUSH_R && distM > 0) {
          const force = (1 - distM / CHIP_PUSH_R) * CHIP_PUSH_STR;
          phys.vx += (dxM / distM) * force;
          phys.vy += (dyM / distM) * force;
        }

        // Spring back to base
        phys.vx += (basX - phys.x) * CHIP_SPRING_K;
        phys.vy += (basY - phys.y) * CHIP_SPRING_K;

        // Damping + integrate
        phys.vx *= CHIP_DAMPING;
        phys.vy *= CHIP_DAMPING;
        phys.x  += phys.vx;
        phys.y  += phys.vy;

        const cx  = phys.x;
        const cy  = phys.y;
        const tw  = ctx.measureText(chip.label).width;
        const bw  = tw + CHIP_PAD_X * 2;
        const bh  = CHIP_H;
        const bx  = cx - bw / 2;
        const by  = cy - bh / 2;

        const ddx  = cx - mx;
        const ddy  = cy - my;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        const glow = Math.max(0, 1 - dist / CHIP_HOVER_R);

        const isHit = mx >= bx && mx <= bx + bw && my >= by && my <= by + bh;
        if (isHit) {
          if (hoveredRef.current !== i) {
            hoveredRef.current = i;
            hoverStartRef.current = now;
          }
        }

        return { chip, cx, cy, bw, bh, bx, by, glow, isHit, index: i };
      }).filter(Boolean) as NonNullable<ReturnType<typeof CHIPS.map>>[number] & {
        chip: ChipDef; cx: number; cy: number; bw: number; bh: number;
        bx: number; by: number; glow: number; isHit: boolean; index: number;
      }[];

      if (!chipMetas.some(m => m.isHit)) hoveredRef.current = -1;

      // ── 2. Draw floating tech chips ───────────────────────────────────────
      ctx.save();
      ctx.font = CHIP_FONT;
      for (const m of chipMetas) {
        const isHovered = hoveredRef.current === m.index;
        const alpha = isHovered ? 0.85 : (0.12 + m.glow * 0.45);

        ctx.globalAlpha = alpha * 0.22;
        ctx.fillStyle   = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
        ctx.fillRect(m.bx, m.by, m.bw, m.bh);

        ctx.globalAlpha = alpha * (isHovered ? 1 : 0.55);
        ctx.strokeStyle = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
        ctx.lineWidth   = isHovered ? 1 : 0.5;
        ctx.strokeRect(m.bx, m.by, m.bw, m.bh);

        ctx.globalAlpha  = alpha;
        ctx.fillStyle    = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(m.chip.label, m.cx, m.cy);
      }
      ctx.restore();

      // ── 3. Dot physics + draw ─────────────────────────────────────────────
      const nearDots: { x: number; y: number }[] = [];

      for (const dot of dotsRef.current) {
        const dxM = dot.x - mx;
        const dyM = dot.y - my;
        const distM = Math.sqrt(dxM * dxM + dyM * dyM);
        if (distM < PUSH_RADIUS && distM > 0) {
          const force = (1 - distM / PUSH_RADIUS) * PUSH_STRENGTH;
          dot.vx += (dxM / distM) * force;
          dot.vy += (dyM / distM) * force;
        }

        dot.vx += (dot.bx - dot.x) * SPRING_K;
        dot.vy += (dot.by - dot.y) * SPRING_K;
        dot.vx *= DAMPING;
        dot.vy *= DAMPING;
        dot.x  += dot.vx;
        dot.y  += dot.vy;

        const dxI   = dot.bx - mx;
        const dyI   = dot.by - my;
        const distI = Math.sqrt(dxI * dxI + dyI * dyI);
        const prox  = Math.max(0, 1 - distI / INFLUENCE_RADIUS);

        dot.opacity += (dot.baseOpacity + prox * 0.65 - dot.opacity) * 0.08;

        const r = Math.round(ACCENT[0] * prox + 240 * (1 - prox));
        const g = Math.round(ACCENT[1] * prox + 240 * (1 - prox));
        const b = Math.round(ACCENT[2] * prox + 240 * (1 - prox));

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size + prox * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${dot.opacity})`;
        ctx.fill();

        if (distI < CONNECT_RADIUS) nearDots.push({ x: dot.x, y: dot.y });
      }

      // ── 4. Constellation lines ────────────────────────────────────────────
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nearDots.length; i++) {
        for (let j = i + 1; j < nearDots.length; j++) {
          const a  = nearDots[i];
          const b  = nearDots[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < LINE_MAX_DIST) {
            const alpha = (1 - d / LINE_MAX_DIST) * 0.35;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${alpha})`;
            ctx.stroke();
          }
        }
      }

      // ── 5. Click — corner-bracket shockwave ───────────────────────────────
      ripplesRef.current = ripplesRef.current.filter(ripple => {
        const age      = now - ripple.startTime;
        if (age >= RIPPLE_DURATION) return false;
        const progress = age / RIPPLE_DURATION;
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);

        ctx.save();

        const maxR   = 160;
        const radius = eased * maxR;
        const fade   = 1 - progress;

        // Push dots whose distance from click falls within the current wave front
        dotsRef.current.forEach((dot, idx) => {
          if (ripple.triggered.has(idx)) return;
          const dx   = dot.bx - ripple.x;
          const dy   = dot.by - ripple.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= radius && dist > 0) {
            const force = (1 - dist / maxR) * IMPULSE_STR;
            dot.vx += (dx / dist) * force;
            dot.vy += (dy / dist) * force;
            ripple.triggered.add(idx);
          }
        });

        // Expanding dashed ring
        ctx.setLineDash([6, 8]);
        ctx.lineDashOffset = -t * 30;
        ctx.lineWidth   = 1;
        ctx.strokeStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${fade * 0.5})`;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // 4 expanding corner brackets
        const BRACKET = 18;
        const corners = [
          { sx: -1, sy: -1 },
          { sx:  1, sy: -1 },
          { sx:  1, sy:  1 },
          { sx: -1, sy:  1 },
        ];
        const bracketAlpha = fade * 0.9;
        ctx.lineWidth   = 1.5;
        ctx.strokeStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${bracketAlpha})`;
        for (const { sx, sy } of corners) {
          const bx = ripple.x + sx * radius;
          const by = ripple.y + sy * radius;
          ctx.beginPath();
          // horizontal arm
          ctx.moveTo(bx - sx * BRACKET, by);
          ctx.lineTo(bx, by);
          // vertical arm
          ctx.lineTo(bx, by - sy * BRACKET);
          ctx.stroke();
        }

        // Center crosshair flash (fast fade)
        if (progress < 0.35) {
          const flashFade = 1 - progress / 0.35;
          const crossLen  = 10 + progress * 20;
          ctx.lineWidth   = 1;
          ctx.strokeStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${flashFade * 0.8})`;
          ctx.beginPath();
          ctx.moveTo(ripple.x - crossLen, ripple.y);
          ctx.lineTo(ripple.x + crossLen, ripple.y);
          ctx.moveTo(ripple.x, ripple.y - crossLen);
          ctx.lineTo(ripple.x, ripple.y + crossLen);
          ctx.stroke();

          // Inner circle flash
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, progress * 28, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${flashFade * 0.6})`;
          ctx.lineWidth   = 1;
          ctx.stroke();
        }

        // Second outer ring (delayed)
        if (progress > 0.12) {
          const p2     = (progress - 0.12) / 0.88;
          const eased2 = 1 - Math.pow(1 - p2, 3);
          ctx.lineWidth   = 0.6;
          ctx.strokeStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${(1 - p2) * 0.25})`;
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, eased2 * maxR * 1.3, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
        return true;
      });

      // ── 6. Tooltip for hovered chip ───────────────────────────────────────
      const hi = hoveredRef.current;
      if (hi >= 0) {
        const m      = chipMetas[hi];
        if (!m) { rafRef.current = requestAnimationFrame(render); return; }
        const fadeIn = Math.min(1, (now - hoverStartRef.current) / TT_FADE_MS);

        let tx = m.cx + m.bw / 2 + 24;
        let ty = m.cy - TT_H / 2;
        if (tx + TT_W > w - TT_MARGIN) tx = m.cx - m.bw / 2 - TT_W - 24;
        if (ty < TT_MARGIN)            ty = TT_MARGIN;
        if (ty + TT_H > h - TT_MARGIN) ty = h - TT_H - TT_MARGIN;

        const corners = [
          { x: tx,        y: ty        },
          { x: tx + TT_W, y: ty        },
          { x: tx,        y: ty + TT_H },
          { x: tx + TT_W, y: ty + TT_H },
        ];
        let anchor = corners[0];
        let minD   = Infinity;
        for (const c of corners) {
          const d = (c.x - m.cx) ** 2 + (c.y - m.cy) ** 2;
          if (d < minD) { minD = d; anchor = c; }
        }

        ctx.save();
        ctx.globalAlpha = fadeIn;

        ctx.beginPath();
        ctx.moveTo(m.cx, m.cy);
        ctx.lineTo(anchor.x, anchor.y);
        ctx.strokeStyle = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
        ctx.lineWidth   = 0.8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(m.cx, m.cy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
        ctx.fill();
        ctx.strokeStyle = "#080808";
        ctx.lineWidth   = 1.5;
        ctx.stroke();

        ctx.fillStyle   = "rgba(6, 6, 6, 0.97)";
        ctx.globalAlpha = fadeIn;
        ctx.fillRect(tx, ty, TT_W, TT_H);

        ctx.strokeStyle = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
        ctx.lineWidth   = 0.8;
        ctx.strokeRect(tx, ty, TT_W, TT_H);

        ctx.fillStyle = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
        ctx.fillRect(tx, ty, TT_W, 1.5);

        ctx.font         = "bold 12px 'Courier New', monospace";
        ctx.fillStyle    = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
        ctx.textAlign    = "left";
        ctx.textBaseline = "top";
        ctx.fillText(m.chip.label, tx + TT_PAD, ty + TT_PAD + 2);

        ctx.font      = "11px 'Courier New', monospace";
        ctx.fillStyle = "rgba(210,210,210,0.65)";
        ctx.fillText(m.chip.desc, tx + TT_PAD, ty + TT_PAD + 22);

        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      section?.removeEventListener("mousemove", handleMouseMove);
      section?.removeEventListener("click",     handleClick);
    };
  }, [buildGrid, buildChips]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}