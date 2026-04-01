import { grooveGrinds } from "./src/data/groove-grinds.js";
import { soulGrinds } from "./src/data/soul-grinds.js";
import { specialNameGrinds } from "./src/data/special-name-grinds.js";

const canvas = document.querySelector('#wheel');
const ctx = canvas.getContext('2d');
const spinEl = document.querySelector('#spin');
const resultEl = document.querySelector('#result');

const PI = Math.PI;
const TAU = 2 * PI;
const rand = (m, M) => Math.random() * (M - m) + m;
const friction = 0.99;

const listMap = {
  'groove-grinds': grooveGrinds,
  'soul-grinds': soulGrinds,
  'special-name-grinds': specialNameGrinds,
};

let rad, arc;
let sectors = [];
let tot = 0;
let angVel = 0;
let ang = 0;
let wasSpinning = false;
let resultTimer = null;
let resizeTimer = null;

// ── Canvas sizing ──────────────────────────────────────────────────────────

function setCanvasSize() {
  const vh = window.visualViewport?.height ?? window.innerHeight;
  // ~160px reserved for header, collapsed selector, gaps, and padding
  const maxFromWidth = window.innerWidth - 32;
  const maxFromHeight = vh - 160;
  const size = Math.min(maxFromWidth, maxFromHeight, 480);
  canvas.width = size;
  canvas.height = size;
  rad = size / 2;
}

// ── Color helpers ──────────────────────────────────────────────────────────

function getTextColor(hex) {
  if (!hex || hex.length < 7) return '#fff';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? '#111' : '#fff';
}

// ── Drawing ────────────────────────────────────────────────────────────────

function drawSector(sector, i) {
  const angle = arc * i;
  ctx.save();

  // Pie slice
  ctx.beginPath();
  ctx.fillStyle = sector.color;
  ctx.moveTo(rad, rad);
  ctx.arc(rad, rad, rad, angle, angle + arc);
  ctx.lineTo(rad, rad);
  ctx.fill();

  // Thin separator
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Label — proportional font, shrinks for long names
  ctx.translate(rad, rad);
  ctx.rotate(angle + arc / 2);
  ctx.textAlign = 'right';
  ctx.fillStyle = getTextColor(sector.color);
  const maxWidth = rad - 30;
  let fontSize = Math.max(10, Math.floor(rad * 0.065));
  ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
  while (ctx.measureText(sector.label).width > maxWidth && fontSize > 8) {
    fontSize--;
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
  }
  ctx.fillText(sector.label, rad - 10, Math.floor(fontSize / 3));

  ctx.restore();
}

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  sectors.forEach(drawSector);
}

// ── Spin logic ─────────────────────────────────────────────────────────────

function getIndex() {
  return Math.floor(tot - (ang / TAU) * tot) % tot;
}

function showResult(sector) {
  resultEl.textContent = sector.label;
  resultEl.style.background = sector.color;
  resultEl.style.color = getTextColor(sector.color);
  resultEl.classList.add('visible');
  clearTimeout(resultTimer);
  resultTimer = setTimeout(() => resultEl.classList.remove('visible'), 4000);
}

function rotate() {
  if (!tot) return;
  const sector = sectors[getIndex()];
  canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
  if (angVel) {
    spinEl.textContent = sector.label;
    spinEl.style.background = sector.color;
  } else {
    spinEl.textContent = 'SPIN';
    spinEl.style.background = '#222';
  }
}

function frame() {
  if (!angVel) {
    if (wasSpinning && tot) {
      showResult(sectors[getIndex()]);
      wasSpinning = false;
    }
    return;
  }
  wasSpinning = true;
  angVel *= friction;
  if (angVel < 0.002) angVel = 0;
  ang += angVel;
  ang %= TAU;
  rotate();
}

function engine() {
  frame();
  requestAnimationFrame(engine);
}

// ── Data helpers ───────────────────────────────────────────────────────────

function getRandomHalf(arr) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.ceil(arr.length / 2));
}

function rebuildSectors() {
  let combined = [];
  document.querySelectorAll('#listSelector input[type="checkbox"]').forEach(cb => {
    if (cb.checked) combined.push(...getRandomHalf(listMap[cb.name]));
  });
  sectors = getRandomHalf(combined);
  tot = sectors.length;
  arc = TAU / (tot || 1);
}

// ── Event handlers ─────────────────────────────────────────────────────────

function handleSpin() {
  if (!angVel && tot) {
    angVel = rand(0.25, 0.45);
    resultEl.classList.remove('visible');
    // Restart pulse animation
    spinEl.classList.remove('spinning');
    void spinEl.offsetWidth;
    spinEl.classList.add('spinning');
  }
}

function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    setCanvasSize();
    if (tot) drawWheel();
    rotate();
  }, 150);
}

// ── Boot ───────────────────────────────────────────────────────────────────

setCanvasSize();
rebuildSectors();
drawWheel();
rotate();
engine();

spinEl.addEventListener('click', handleSpin);
window.addEventListener('resize', handleResize);

document.querySelectorAll('#listSelector input[type="checkbox"]').forEach(input => {
  input.addEventListener('change', () => {
    rebuildSectors();
    if (tot) drawWheel();
    rotate();
  });
});
