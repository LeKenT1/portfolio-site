"use client";

import { useEffect, useRef, useCallback } from "react";

interface Dot {
  x: number;
  y: number;
  baseOpacity: number;
  opacity: number;
  size: number;
}

interface Ripple {
  x: number;
  y: number;
  startTime: number;
}

interface Chip {
  label: string;
  desc:  string;
  bx: number;
  by: number;
  phase: number;
}

const CHIPS: Chip[] = [
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
const RIPPLE_DURATION  = 1200;
const RIPPLE_MAX_R     = 180;

// Chip visual constants
const CHIP_FONT     = "12px 'Courier New', monospace";
const CHIP_PAD_X    = 12;
const CHIP_H        = 28;

// Tooltip constants
const TT_W          = 168;
const TT_H          = 58;
const TT_PAD        = 13;
const TT_MARGIN     = 16; // min distance from canvas edge
const TT_FADE_MS    = 180;

export function GenerativeGrid() {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const mouseRef       = useRef({ x: -1000, y: -1000 });
  const dotsRef        = useRef<Dot[]>([]);
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
        dots.push({
          x: c * gap,
          y: r * gap,
          baseOpacity: 0.12 + Math.random() * 0.1,
          opacity: 0.12,
          size: 1,
        });
      }
    }
    dotsRef.current = dots;
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
      ripplesRef.current.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        startTime: Date.now(),
      });
      if (ripplesRef.current.length > 6) ripplesRef.current.shift();
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

      // ── 1. Compute chip positions + detect hovered chip ───────────────────
      ctx.font = CHIP_FONT;
      const chipMetas = CHIPS.map((chip, i) => {
        const cx  = chip.bx * w;
        const cy  = chip.by * h + Math.sin(t * 0.55 + chip.phase) * 5;
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
      });

      // Clear hover if no chip hit
      if (!chipMetas.some(m => m.isHit)) hoveredRef.current = -1;

      // ── 2. Draw floating tech chips ───────────────────────────────────────
      ctx.save();
      ctx.font = CHIP_FONT;
      for (const m of chipMetas) {
        const isHovered = hoveredRef.current === m.index;
        const alpha = isHovered ? 0.85 : (0.12 + m.glow * 0.45);

        // Fill
        ctx.globalAlpha = alpha * 0.22;
        ctx.fillStyle   = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
        ctx.fillRect(m.bx, m.by, m.bw, m.bh);

        // Border
        ctx.globalAlpha = alpha * (isHovered ? 1 : 0.55);
        ctx.strokeStyle = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
        ctx.lineWidth   = isHovered ? 1 : 0.5;
        ctx.strokeRect(m.bx, m.by, m.bw, m.bh);

        // Label
        ctx.globalAlpha  = alpha;
        ctx.fillStyle    = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(m.chip.label, m.cx, m.cy);
      }
      ctx.restore();

      // ── 3. Dots + collect near-mouse dots ─────────────────────────────────
      const nearDots: Dot[] = [];

      for (const dot of dotsRef.current) {
        const dx   = dot.x - mx;
        const dy   = dot.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const prox = Math.max(0, 1 - dist / INFLUENCE_RADIUS);

        dot.opacity += (dot.baseOpacity + prox * 0.65 - dot.opacity) * 0.08;

        const r = Math.round(ACCENT[0] * prox + 240 * (1 - prox));
        const g = Math.round(ACCENT[1] * prox + 240 * (1 - prox));
        const b = Math.round(ACCENT[2] * prox + 240 * (1 - prox));

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size + prox * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${dot.opacity})`;
        ctx.fill();

        if (dist < CONNECT_RADIUS) nearDots.push(dot);
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

      // ── 5. Click ripples ──────────────────────────────────────────────────
      ripplesRef.current = ripplesRef.current.filter(ripple => {
        const age      = now - ripple.startTime;
        if (age >= RIPPLE_DURATION) return false;
        const progress = age / RIPPLE_DURATION;
        const eased    = 1 - Math.pow(1 - progress, 3);

        ctx.lineWidth   = 1;
        ctx.strokeStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${(1 - progress) * 0.5})`;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, eased * RIPPLE_MAX_R, 0, Math.PI * 2);
        ctx.stroke();

        if (progress > 0.15) {
          const p2     = (progress - 0.15) / 0.85;
          const eased2 = 1 - Math.pow(1 - p2, 3);
          ctx.lineWidth   = 0.5;
          ctx.strokeStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${(1 - p2) * 0.28})`;
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, eased2 * RIPPLE_MAX_R * 0.75, 0, Math.PI * 2);
          ctx.stroke();
        }

        return true;
      });

      // ── 6. Tooltip for hovered chip ───────────────────────────────────────
      const hi = hoveredRef.current;
      if (hi >= 0) {
        const m      = chipMetas[hi];
        const fadeIn = Math.min(1, (now - hoverStartRef.current) / TT_FADE_MS);

        // Position tooltip: prefer right of chip, flip if too close to edge
        let tx = m.cx + m.bw / 2 + 24;
        let ty = m.cy - TT_H / 2;
        if (tx + TT_W > w - TT_MARGIN) tx = m.cx - m.bw / 2 - TT_W - 24;
        if (ty < TT_MARGIN)            ty = TT_MARGIN;
        if (ty + TT_H > h - TT_MARGIN) ty = h - TT_H - TT_MARGIN;

        // Nearest tooltip corner for the connecting line
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

        // Connecting line
        ctx.beginPath();
        ctx.moveTo(m.cx, m.cy);
        ctx.lineTo(anchor.x, anchor.y);
        ctx.strokeStyle = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
        ctx.lineWidth   = 0.8;
        ctx.stroke();

        // Dot at chip anchor
        ctx.beginPath();
        ctx.arc(m.cx, m.cy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
        ctx.fill();
        ctx.strokeStyle = "#080808";
        ctx.lineWidth   = 1.5;
        ctx.stroke();

        // Tooltip background
        ctx.fillStyle   = "rgba(6, 6, 6, 0.97)";
        ctx.globalAlpha = fadeIn;
        ctx.fillRect(tx, ty, TT_W, TT_H);

        // Tooltip border
        ctx.strokeStyle = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
        ctx.lineWidth   = 0.8;
        ctx.strokeRect(tx, ty, TT_W, TT_H);

        // Top accent line
        ctx.fillStyle   = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
        ctx.fillRect(tx, ty, TT_W, 1.5);

        // Chip label (title)
        ctx.font         = "bold 12px 'Courier New', monospace";
        ctx.fillStyle    = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
        ctx.textAlign    = "left";
        ctx.textBaseline = "top";
        ctx.fillText(m.chip.label, tx + TT_PAD, ty + TT_PAD + 2);

        // Description
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
  }, [buildGrid]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}
