import { grooveGrinds } from "./src/data/groove-grinds.js";
import { soulGrinds } from "./src/data/soul-grinds.js";
import { specialNameGrinds } from "./src/data/special-name-grinds.js";
import { variations } from "./src/data/variations.js";

const canvas = document.querySelector('#wheel');
const ctx = canvas.getContext('2d');
const spinEl = document.querySelector('#spin');
const resultEl = document.querySelector('#result');
const resultTextEl = document.querySelector('#result-text');
const resultSkipEl = document.querySelector('#result-skip');
const reshuffleEl = document.querySelector('#reshuffle');
const historyEl = document.querySelector('#history');

const PI = Math.PI;
const TAU = 2 * PI;
const rand = (m, M) => Math.random() * (M - m) + m;
const friction = 0.99;
const TARGET_COUNT = 12;
const MAX_HISTORY = 5;

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
let excluded = new Set();
let lastLanded = null;
let sessionHistory = [];

// ── Canvas sizing ──────────────────────────────────────────────────────────

function setCanvasSize() {
  const vh = window.visualViewport?.height ?? window.innerHeight;
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

  ctx.beginPath();
  ctx.fillStyle = sector.color;
  ctx.moveTo(rad, rad);
  ctx.arc(rad, rad, rad, angle, angle + arc);
  ctx.lineTo(rad, rad);
  ctx.fill();

  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

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

function getVariation() {
  const toggle = document.getElementById('variations-toggle');
  if (!toggle?.checked) return null;
  const valid = variations.filter(v => v.color && v.color.length >= 7);
  return valid[Math.floor(Math.random() * valid.length)] ?? null;
}

function addToHistory(label, color) {
  sessionHistory.unshift({ label, color });
  if (sessionHistory.length > MAX_HISTORY) sessionHistory.pop();
  renderHistory();
}

function renderHistory() {
  if (!sessionHistory.length) { historyEl.innerHTML = ''; return; }
  historyEl.innerHTML = sessionHistory.map((h, i) =>
    `<div class="history-item" style="background:${h.color};color:${getTextColor(h.color)};opacity:${1 - i * 0.15}">${h.label}</div>`
  ).join('');
}

function showResult(sector) {
  const variation = getVariation();
  const displayLabel = variation ? `${sector.label} — ${variation.label}` : sector.label;

  resultTextEl.textContent = displayLabel;
  resultEl.style.background = sector.color;
  resultEl.style.color = getTextColor(sector.color);
  resultEl.classList.add('visible');
  clearTimeout(resultTimer);
  resultTimer = setTimeout(() => resultEl.classList.remove('visible'), 4000);

  // Store base label only for exclusion logic
  lastLanded = sector.label;
  addToHistory(displayLabel, sector.color);

  // Quietly rebuild wheel while result is visible, excluding what just landed
  setTimeout(() => {
    rebuildSectors(sector.label);
    drawWheel();
    rotate();
  }, 400);
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

function rebuildSectors(tempExclude = null) {
  let pool = [];
  document.querySelectorAll('#listSelector input[type="checkbox"]').forEach(cb => {
    if (cb.checked && listMap[cb.name]) pool.push(...listMap[cb.name]);
  });

  // Filter out user-skipped tricks
  let filtered = pool.filter(t => !excluded.has(t.label));
  // Temporarily exclude the last-landed trick to prevent immediate repeats
  if (tempExclude && filtered.length > 1) {
    filtered = filtered.filter(t => t.label !== tempExclude);
  }
  // Fall back to full pool if filtering left too little
  if (filtered.length < 3) filtered = pool.length ? pool : filtered;

  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  sectors = shuffled.slice(0, Math.min(TARGET_COUNT, shuffled.length));
  tot = sectors.length;
  arc = TAU / (tot || 1);
}

// ── Event handlers ─────────────────────────────────────────────────────────

function handleSpin() {
  if (!angVel && tot) {
    angVel = rand(0.25, 0.45);
    resultEl.classList.remove('visible');
    spinEl.classList.remove('spinning');
    void spinEl.offsetWidth;
    spinEl.classList.add('spinning');
  }
}

function handleReshuffle() {
  excluded.clear();
  lastLanded = null;
  rebuildSectors();
  drawWheel();
  rotate();
  resultEl.classList.remove('visible');
  clearTimeout(resultTimer);
}

function handleSkip() {
  if (!lastLanded) return;
  excluded.add(lastLanded);
  resultEl.classList.remove('visible');
  clearTimeout(resultTimer);
  rebuildSectors();
  drawWheel();
  rotate();
  if (tot) {
    angVel = rand(0.25, 0.45);
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
reshuffleEl.addEventListener('click', handleReshuffle);
resultSkipEl.addEventListener('click', handleSkip);
window.addEventListener('resize', handleResize);

document.querySelectorAll('#listSelector input[type="checkbox"]').forEach(input => {
  input.addEventListener('change', () => {
    if (!listMap[input.name]) return; // variations-toggle — no rebuild needed
    excluded.clear();
    lastLanded = null;
    rebuildSectors();
    if (tot) drawWheel();
    rotate();
  });
});
