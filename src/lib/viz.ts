import katex from 'katex';
import { scaleLinear } from 'd3-scale';

export const theme = () => {
  const style = getComputedStyle(document.documentElement);
  const v = (name: string) => style.getPropertyValue(name).trim();
  return { fg: v('--fg'), muted: v('--muted'), line: v('--line'), accent: v('--accent'), surface: v('--surface'), mono: v('--mono') };
};

/** Fills an element with text whose $…$ segments are rendered as math. */
export const setStatus = (el: HTMLElement, text: string) => {
  el.innerHTML = text
    .split(/(\$[^$]+\$)/)
    .map((part) =>
      part.length > 2 && part.startsWith('$') && part.endsWith('$')
        ? katex.renderToString(part.slice(1, -1), { throwOnError: false })
        : part.replace(/&/g, '&amp;').replace(/</g, '&lt;'),
    )
    .join('');
};

export const fitCanvas = (canvas: HTMLCanvasElement, height: number) => {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const width = canvas.clientWidth;
  canvas.style.height = `${height}px`;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width };
};

export const redrawOn = (canvas: HTMLCanvasElement, draw: () => void) => {
  let width = -1;
  new ResizeObserver(() => {
    if (canvas.clientWidth === width) return;
    width = canvas.clientWidth;
    requestAnimationFrame(draw);
  }).observe(canvas);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', draw);
};

/** Draws a side-view bicopter whose right arm is raised by `angle` radians. */
export const drawBicopter = (ctx: CanvasRenderingContext2D, cx: number, cy: number, half: number, angle: number, spin: number) => {
  const t = theme();
  const ux = Math.cos(angle);
  const uy = -Math.sin(angle);
  const nx = uy;
  const ny = -ux;
  ctx.strokeStyle = t.fg;
  ctx.fillStyle = t.fg;
  ctx.lineCap = 'round';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - ux * half, cy - uy * half);
  ctx.lineTo(cx + ux * half, cy + uy * half);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 7, 0, Math.PI * 2);
  ctx.fill();
  for (const side of [-1, 1]) {
    const px = cx + side * ux * half;
    const py = cy + side * uy * half;
    const mx = px + nx * 11;
    const my = py + ny * 11;
    ctx.lineWidth = 3;
    ctx.strokeStyle = t.fg;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(mx, my);
    ctx.stroke();
    const blade = 22 * Math.abs(Math.cos(spin + side));
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(mx - ux * 22, my - uy * 22);
    ctx.lineTo(mx + ux * 22, my + uy * 22);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(mx - ux * blade, my - uy * blade);
    ctx.lineTo(mx + ux * blade, my + uy * blade);
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
};

/** Draws an axis box with horizontal grid lines and returns its scales. */
export const panel = (
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; w: number; h: number },
  xDomain: [number, number],
  yDomain: [number, number],
  title: string,
) => {
  const t = theme();
  const x = scaleLinear().domain(xDomain).range([box.x, box.x + box.w]);
  const y = scaleLinear().domain(yDomain).nice(4).range([box.y + box.h, box.y]);
  ctx.font = `11px ${t.mono}`;
  ctx.lineWidth = 1;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'right';
  for (const tick of y.ticks(4)) {
    ctx.strokeStyle = t.line;
    ctx.beginPath();
    ctx.moveTo(box.x, Math.round(y(tick)) + 0.5);
    ctx.lineTo(box.x + box.w, Math.round(y(tick)) + 0.5);
    ctx.stroke();
    ctx.fillStyle = t.muted;
    ctx.fillText(y.tickFormat(4)(tick), box.x - 6, y(tick));
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = t.fg;
  ctx.fillText(title, box.x + 6, box.y + 2);
  return { x, y };
};
