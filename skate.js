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
const customizeBtnEl = document.querySelector('#customizeBtn');
const customModeBarEl = document.querySelector('#customModeBar');
const clearCustomEl = document.querySelector('#clearCustom');
const trickModalEl = document.querySelector('#trickModal');
const modalBackdropEl = document.querySelector('#modalBackdrop');
const modalTitleEl = document.querySelector('#modalTitle');
const modalPageEl = document.querySelector('#modalPage');
const modalListEl = document.querySelector('#modalList');
const modalErrorEl = document.querySelector('#modalError');
const modalPrevEl = document.querySelector('#modalPrev');
const modalNextEl = document.querySelector('#modalNext');
const selectAllEl = document.querySelector('#selectAll');
const selectNoneEl = document.querySelector('#selectNone');
const modalCloseEl = document.querySelector('#modalClose');

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

// Custom mode state
let customMode = false;
let customTricks = [];   // in-memory copy of saved trick objects
let customVariations = []; // in-memory copy of saved variation objects
let customVariationsEnabled = false;

// Modal state
let modalPage = 0;
let modalDraft = { tricks: new Set(), variations: new Set(), variationsEnabled: false };

const MODAL_PAGES = [
  { title: 'Groove Grinds',       data: grooveGrinds },
  { title: 'Soul Grinds',         data: soulGrinds },
  { title: 'Special Name Grinds', data: specialNameGrinds },
  { title: 'Variations',          data: variations, isVariations: true },
];

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
  if (customMode) {
    if (!customVariationsEnabled || customVariations.length === 0) return null;
    const valid = customVariations.filter(v => v.color && v.color.length >= 7);
    return valid[Math.floor(Math.random() * valid.length)] ?? null;
  }
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
  if (customMode) {
    pool = [...customTricks];
  } else {
    document.querySelectorAll('#listSelector input[type="checkbox"]').forEach(cb => {
      if (cb.checked && listMap[cb.name]) pool.push(...listMap[cb.name]);
    });
  }

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

// ── IndexedDB ──────────────────────────────────────────────────────────────

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('skateDB', 1);
    req.onupgradeneeded = e => {
      e.target.result.createObjectStore('userSelections', { keyPath: 'id' });
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e.target.error);
  });
}

async function loadCustomSelections() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('userSelections', 'readonly');
    const req = tx.objectStore('userSelections').get('main');
    req.onsuccess = e => resolve(e.target.result ?? null);
    req.onerror = e => reject(e.target.error);
  });
}

async function saveCustomSelections(data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('userSelections', 'readwrite');
    const req = tx.objectStore('userSelections').put({ id: 'main', ...data });
    req.onsuccess = () => resolve();
    req.onerror = e => reject(e.target.error);
  });
}

async function clearCustomSelections() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('userSelections', 'readwrite');
    const req = tx.objectStore('userSelections').delete('main');
    req.onsuccess = () => resolve();
    req.onerror = e => reject(e.target.error);
  });
}

// ── Custom mode helpers ────────────────────────────────────────────────────

function applyCustomMode(record) {
  // Resolve trick objects from saved labels
  const allTricks = [...grooveGrinds, ...soulGrinds, ...specialNameGrinds];
  customTricks = allTricks.filter(t => record.tricks.includes(t.label));
  customVariations = variations.filter(v => record.variations.includes(v.label));
  customVariationsEnabled = record.variationsEnabled;

  customMode = true;
  customModeBarEl.hidden = false;
  document.querySelector('#listSelector').classList.add('disabled');
  document.querySelector('#variations-toggle').disabled = true;
}

function disableCustomMode() {
  customMode = false;
  customTricks = [];
  customVariations = [];
  customVariationsEnabled = false;
  customModeBarEl.hidden = true;
  document.querySelector('#listSelector').classList.remove('disabled');
  document.querySelector('#variations-toggle').disabled = false;
}

// ── Modal ──────────────────────────────────────────────────────────────────

function openModal() {
  // Populate draft from current custom selection (or blank)
  if (customMode) {
    modalDraft.tricks = new Set(customTricks.map(t => t.label));
    modalDraft.variations = new Set(customVariations.map(v => v.label));
    modalDraft.variationsEnabled = customVariationsEnabled;
  } else {
    modalDraft.tricks = new Set();
    modalDraft.variations = new Set();
    modalDraft.variationsEnabled = false;
  }
  modalPage = 0;
  trickModalEl.hidden = false;
  document.body.style.overflow = 'hidden';
  renderModalPage(modalPage);
}

function closeModal() {
  trickModalEl.hidden = true;
  document.body.style.overflow = '';
  modalErrorEl.hidden = true;
}

function renderModalPage(i) {
  const page = MODAL_PAGES[i];
  modalTitleEl.textContent = page.title;
  modalPageEl.textContent = `(${i + 1}/${MODAL_PAGES.length})`;

  // Prev button visibility
  modalPrevEl.style.visibility = i === 0 ? 'hidden' : 'visible';

  // Next/Save label
  modalNextEl.textContent = i === MODAL_PAGES.length - 1 ? 'Save' : 'Next →';

  // Build list
  let html = '';

  if (page.isVariations) {
    const checked = modalDraft.variationsEnabled ? 'checked' : '';
    html += `<label class="modal-toggle-label">
      <input type="checkbox" id="varToggle" class="modal-var-toggle" ${checked}>
      Apply a variation to each result
    </label>`;
  }

  html += page.data.map(item => {
    const set = page.isVariations ? modalDraft.variations : modalDraft.tricks;
    const checked = set.has(item.label) ? 'checked' : '';
    return `<label class="modal-item-label">
      <input type="checkbox" class="modal-item-cb" data-label="${item.label}" ${checked}>
      <span class="modal-item-dot" style="background:${item.color}"></span>
      ${item.label}
    </label>`;
  }).join('');

  modalListEl.innerHTML = html;
  modalListEl.scrollTop = 0;
  modalErrorEl.hidden = true;

  // Wire variation toggle
  if (page.isVariations) {
    modalListEl.querySelector('#varToggle').addEventListener('change', e => {
      modalDraft.variationsEnabled = e.target.checked;
    });
  }

  // Wire item checkboxes
  modalListEl.querySelectorAll('.modal-item-cb').forEach(cb => {
    cb.addEventListener('change', e => {
      const set = page.isVariations ? modalDraft.variations : modalDraft.tricks;
      if (e.target.checked) set.add(e.target.dataset.label);
      else set.delete(e.target.dataset.label);
    });
  });
}

async function handleModalSave() {
  if (modalDraft.tricks.size === 0) {
    modalErrorEl.hidden = false;
    return;
  }
  const record = {
    tricks: [...modalDraft.tricks],
    variations: [...modalDraft.variations],
    variationsEnabled: modalDraft.variationsEnabled,
  };
  await saveCustomSelections(record);
  applyCustomMode(record);
  closeModal();
  excluded.clear();
  lastLanded = null;
  rebuildSectors();
  drawWheel();
  rotate();
}

async function handleClearCustom() {
  await clearCustomSelections();
  disableCustomMode();
  excluded.clear();
  lastLanded = null;
  rebuildSectors();
  drawWheel();
  rotate();
}

// ── Boot ───────────────────────────────────────────────────────────────────

setCanvasSize();
engine();

// Load custom selections from IndexedDB before first render
loadCustomSelections().then(record => {
  if (record) applyCustomMode(record);
  rebuildSectors();
  drawWheel();
  rotate();
}).catch(() => {
  rebuildSectors();
  drawWheel();
  rotate();
});

spinEl.addEventListener('click', handleSpin);
reshuffleEl.addEventListener('click', handleReshuffle);
resultSkipEl.addEventListener('click', handleSkip);
window.addEventListener('resize', handleResize);

// Category checkboxes
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

// Modal event listeners
customizeBtnEl.addEventListener('click', openModal);
clearCustomEl.addEventListener('click', handleClearCustom);
modalCloseEl.addEventListener('click', closeModal);
modalBackdropEl.addEventListener('click', closeModal);

modalPrevEl.addEventListener('click', () => {
  if (modalPage > 0) {
    modalPage--;
    renderModalPage(modalPage);
  }
});

modalNextEl.addEventListener('click', () => {
  if (modalPage < MODAL_PAGES.length - 1) {
    modalPage++;
    renderModalPage(modalPage);
  } else {
    handleModalSave();
  }
});

selectAllEl.addEventListener('click', () => {
  const page = MODAL_PAGES[modalPage];
  const set = page.isVariations ? modalDraft.variations : modalDraft.tricks;
  page.data.forEach(item => set.add(item.label));
  modalListEl.querySelectorAll('.modal-item-cb').forEach(cb => { cb.checked = true; });
});

selectNoneEl.addEventListener('click', () => {
  const page = MODAL_PAGES[modalPage];
  const set = page.isVariations ? modalDraft.variations : modalDraft.tricks;
  page.data.forEach(item => set.delete(item.label));
  modalListEl.querySelectorAll('.modal-item-cb').forEach(cb => { cb.checked = false; });
});
