"use client";

import { useEffect, useRef } from "react";

const PIECES = [
  { cells: [[1,1,1,1]],           color: [95,  190, 185] as const }, // I – teal
  { cells: [[1,1],[1,1]],          color: [200, 169, 126] as const }, // O – gold
  { cells: [[0,1,0],[1,1,1]],      color: [170, 135, 195] as const }, // T – lavender
  { cells: [[0,1,1],[1,1,0]],      color: [120, 185, 135] as const }, // S – sage
  { cells: [[1,1,0],[0,1,1]],      color: [200, 118, 118] as const }, // Z – rose
  { cells: [[1,0,0],[1,1,1]],      color: [118, 150, 205] as const }, // J – blue
  { cells: [[0,0,1],[1,1,1]],      color: [210, 148,  95] as const }, // L – amber
] as const;

const COLS  = 10;
const ROWS  = 20;
const ACC   = [200, 169, 126] as const;

type Color = readonly [number, number, number];
type Board = (Color | null)[][];

interface Piece { type: number; cells: number[][]; color: Color; x: number; y: number; }

function rotateCW(cells: number[][]): number[][] {
  return Array.from({ length: cells[0].length }, (_, c) =>
    Array.from({ length: cells.length }, (_, r) => cells[cells.length - 1 - r][c])
  );
}

function empty(): Board { return Array.from({ length: ROWS }, () => Array(COLS).fill(null)); }

function fits(board: Board, p: Piece, dx = 0, dy = 0): boolean {
  for (let r = 0; r < p.cells.length; r++)
    for (let c = 0; c < p.cells[r].length; c++) {
      if (!p.cells[r][c]) continue;
      const nx = p.x + c + dx, ny = p.y + r + dy;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
      if (ny >= 0 && board[ny][nx] !== null) return false;
    }
  return true;
}

function stamp(board: Board, p: Piece): Board {
  const b = board.map(r => [...r]) as Board;
  for (let r = 0; r < p.cells.length; r++)
    for (let c = 0; c < p.cells[r].length; c++) {
      if (!p.cells[r][c]) continue;
      if (p.y + r >= 0) b[p.y + r][p.x + c] = p.color;
    }
  return b;
}

function sweep(board: Board): { board: Board; rows: number[]; count: number } {
  const rows: number[] = [];
  const kept = board.filter((row, r) => { if (row.every(c => c)) { rows.push(r); return false; } return true; });
  return { board: [...Array.from({ length: rows.length }, () => Array(COLS).fill(null)), ...kept] as Board, rows, count: rows.length };
}

function ghost(board: Board, p: Piece): number { let d = 0; while (fits(board, p, 0, d + 1)) d++; return p.y + d; }

function spawn(type: number): Piece {
  const def = PIECES[type];
  return { type, cells: def.cells.map(r => [...r]), color: def.color, x: Math.floor((COLS - def.cells[0].length) / 2), y: 0 };
}

const PTS = [0, 100, 300, 500, 800];

export function TetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mountTime = Date.now();

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // Game state
    let board    = empty();
    let cur      = spawn(Math.floor(Math.random() * 7));
    let nextT    = Math.floor(Math.random() * 7);
    let score    = 0, lines = 0, level = 1;
    let over     = false, paused = false;
    let lastDrop = Date.now();
    let clearAnim: { rows: number[]; t0: number } | null = null;

    const dropMs = () => Math.max(80, 900 - (level - 1) * 85);

    const spawnNext = () => {
      cur   = spawn(nextT);
      nextT = Math.floor(Math.random() * 7);
      if (!fits(board, cur)) over = true;
    };

    const lock = () => {
      board = stamp(board, cur);
      const { board: nb, rows, count } = sweep(board);
      if (count > 0) {
        clearAnim = { rows, t0: Date.now() };
        board  = nb;
        score += PTS[Math.min(count, 4)] * level;
        lines += count;
        level  = Math.floor(lines / 10) + 1;
      }
      spawnNext();
    };

    const drop = () => { if (fits(board, cur, 0, 1)) { cur = { ...cur, y: cur.y + 1 }; return true; } lock(); return false; };
    const hardDrop = () => { const gy = ghost(board, cur); score += (gy - cur.y) * 2; cur = { ...cur, y: gy }; lock(); };

    const tryRotate = () => {
      const rot = { ...cur, cells: rotateCW(cur.cells) };
      for (const dx of [0, -1, 1, -2, 2]) { if (fits(board, rot, dx)) { cur = { ...rot, x: rot.x + dx }; return; } }
    };

    const restart = () => {
      board = empty(); cur = spawn(Math.floor(Math.random() * 7)); nextT = Math.floor(Math.random() * 7);
      score = 0; lines = 0; level = 1; over = false; paused = false; lastDrop = Date.now(); clearAnim = null;
    };

    const GAME_KEYS = new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," ","x","X","p","P","Escape","Enter"]);

    const onKey = (e: KeyboardEvent) => {
      if (!GAME_KEYS.has(e.key)) return;
      // Capture phase + stopImmediatePropagation prevents section nav from seeing these keys
      e.stopImmediatePropagation();
      e.preventDefault();

      if (over) { if (e.key === "Enter" || e.key === " ") restart(); return; }
      if (e.key === "p" || e.key === "P" || e.key === "Escape") { paused = !paused; return; }
      if (paused) return;
      switch (e.key) {
        case "ArrowLeft":  if (fits(board, cur, -1)) cur = { ...cur, x: cur.x - 1 }; break;
        case "ArrowRight": if (fits(board, cur,  1)) cur = { ...cur, x: cur.x + 1 }; break;
        case "ArrowDown":  drop(); break;
        case "ArrowUp": case "x": case "X": tryRotate(); break;
        case " ": hardDrop(); break;
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });

    const drawBlock = (px: number, py: number, cs: number, color: Color, a = 1, g = false) => {
      if (g) {
        ctx.globalAlpha = 0.12;
        ctx.fillStyle   = `rgb(${color[0]},${color[1]},${color[2]})`;
        ctx.fillRect(px + 1, py + 1, cs - 2, cs - 2);
        ctx.globalAlpha = 0.22;
        ctx.strokeStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
        ctx.lineWidth   = 0.8;
        ctx.strokeRect(px + 1.5, py + 1.5, cs - 3, cs - 3);
        ctx.globalAlpha = 1;
        return;
      }
      ctx.globalAlpha = a;
      ctx.fillStyle   = `rgb(${color[0]},${color[1]},${color[2]})`;
      ctx.fillRect(px + 1, py + 1, cs - 2, cs - 2);
      ctx.fillStyle   = "rgba(255,255,255,0.16)";
      ctx.fillRect(px + 2, py + 2, cs - 4, 2);
      ctx.fillRect(px + 2, py + 2, 2, cs - 4);
      ctx.fillStyle   = "rgba(0,0,0,0.22)";
      ctx.fillRect(px + 2, py + cs - 4, cs - 4, 2);
      ctx.fillRect(px + cs - 4, py + 2, 2, cs - 4);
      ctx.globalAlpha = 1;
    };

    let rafId = 0;

    const render = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      const now = Date.now();

      // Responsive cell size
      const cs = Math.min(34, Math.max(18,
        Math.floor((h - 80) / (ROWS + 2)),
        Math.floor((w * 0.48) / COLS)
      ));
      const bW = COLS * cs, bH = ROWS * cs;
      const pW = 124;
      const bX = Math.floor((w - bW - 20 - pW) / 2);
      const bY = Math.floor((h - bH) / 2);
      const pX = bX + bW + 20;
      const pY = bY;

      // Background
      ctx.fillStyle = "#060606";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.022)";
      for (let x = 0; x < w; x += 24) for (let y = 0; y < h; y += 24) ctx.fillRect(x, y, 1, 1);

      ctx.save();
      ctx.translate(bX, bY);

      // Board bg
      ctx.fillStyle = "rgba(255,255,255,0.016)";
      ctx.fillRect(0, 0, bW, bH);

      // Grid
      ctx.strokeStyle = "rgba(255,255,255,0.035)";
      ctx.lineWidth   = 0.5;
      for (let c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(c * cs, 0); ctx.lineTo(c * cs, bH); ctx.stroke(); }
      for (let r = 0; r <= ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r * cs); ctx.lineTo(bW, r * cs); ctx.stroke(); }

      // Placed blocks
      const cp = clearAnim ? Math.min(1, (now - clearAnim.t0) / 320) : 1;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = board[r][c];
          if (!cell) continue;
          if (clearAnim?.rows.includes(r)) {
            ctx.globalAlpha = 1 - cp;
            ctx.fillStyle   = `rgba(255,255,255,${0.4 + Math.sin(cp * Math.PI) * 0.6})`;
            ctx.fillRect(c * cs + 1, r * cs + 1, cs - 2, cs - 2);
            ctx.globalAlpha = 1;
          } else {
            drawBlock(c * cs, r * cs, cs, cell);
          }
        }
      }

      if (!over && !paused) {
        // Ghost
        const gy = ghost(board, cur);
        if (gy > cur.y)
          for (let r = 0; r < cur.cells.length; r++)
            for (let c = 0; c < cur.cells[r].length; c++)
              if (cur.cells[r][c]) drawBlock((cur.x + c) * cs, (gy + r) * cs, cs, cur.color, 1, true);

        // Active piece
        for (let r = 0; r < cur.cells.length; r++)
          for (let c = 0; c < cur.cells[r].length; c++)
            if (cur.cells[r][c] && cur.y + r >= 0) drawBlock((cur.x + c) * cs, (cur.y + r) * cs, cs, cur.color);
      }

      // Board border
      ctx.strokeStyle = `rgba(${ACC[0]},${ACC[1]},${ACC[2]},0.3)`;
      ctx.lineWidth   = 1;
      ctx.strokeRect(0.5, 0.5, bW - 1, bH - 1);

      ctx.restore();

      // Panel
      const label = (text: string, val: string, y: number) => {
        ctx.font      = "9px 'Courier New', monospace";
        ctx.fillStyle = `rgba(${ACC[0]},${ACC[1]},${ACC[2]},0.35)`;
        ctx.textAlign = "left";
        ctx.fillText(text, pX, pY + y);
        ctx.font      = "bold 15px 'Courier New', monospace";
        ctx.fillStyle = `rgba(${ACC[0]},${ACC[1]},${ACC[2]},0.9)`;
        ctx.fillText(val, pX, pY + y + 17);
      };
      label("SCORE", String(score).padStart(6, "0"), 20);
      label("LINES", String(lines), 66);
      label("LEVEL", String(level), 108);

      // Next piece
      ctx.font      = "9px 'Courier New', monospace";
      ctx.fillStyle = `rgba(${ACC[0]},${ACC[1]},${ACC[2]},0.35)`;
      ctx.textAlign = "left";
      ctx.fillText("NEXT", pX, pY + 152);

      const nDef  = PIECES[nextT];
      const nCs   = 20;
      const nOffX = pX + (pW - nDef.cells[0].length * nCs) / 2 - 12;
      const nOffY = pY + 164;
      for (let r = 0; r < nDef.cells.length; r++)
        for (let c = 0; c < nDef.cells[r].length; c++)
          if (nDef.cells[r][c]) drawBlock(nOffX + c * nCs, nOffY + r * nCs, nCs, nDef.color);

      // Hints
      ctx.font      = "11px 'Courier New', monospace";
      ctx.fillStyle = `rgba(${ACC[0]},${ACC[1]},${ACC[2]},0.55)`;
      ctx.textAlign = "left";
      ["← → move", "↑  rotate", "↓  soft drop", "SPC hard drop", "P  pause"].forEach((h, i, a) => {
        ctx.fillText(h, pX, pY + bH - (a.length - i) * 18 - 6);
      });

      // Auto drop
      if (!over && !paused && !clearAnim && now - lastDrop >= dropMs()) { drop(); lastDrop = now; }
      if (clearAnim && cp >= 1) { clearAnim = null; lastDrop = now; }

      // Overlays
      const overlay = (title: string, sub: string[]) => {
        ctx.fillStyle = "rgba(6,6,6,0.88)";
        ctx.fillRect(0, 0, w, h);
        ctx.textAlign = "center";
        ctx.font      = "bold 24px 'Courier New', monospace";
        ctx.fillStyle = `rgb(${ACC[0]},${ACC[1]},${ACC[2]})`;
        ctx.fillText(title, w / 2, h / 2 - 16);
        sub.forEach((s, i) => {
          ctx.font      = "10px 'Courier New', monospace";
          ctx.fillStyle = `rgba(${ACC[0]},${ACC[1]},${ACC[2]},0.45)`;
          ctx.fillText(s, w / 2, h / 2 + 8 + i * 18);
        });
      };
      if (over)            overlay("GAME OVER",  [`SCORE  ${String(score).padStart(6,"0")}`, "PRESS ENTER TO RESTART"]);
      if (paused && !over) overlay("PAUSED",     ["P TO RESUME"]);

      // Fade-in on mount
      const age = now - mountTime;
      if (age < 900) {
        ctx.fillStyle = `rgba(6,6,6,${1 - age / 900})`;
        ctx.fillRect(0, 0, w, h);
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(rafId); ro.disconnect(); window.removeEventListener("keydown", onKey, { capture: true }); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
