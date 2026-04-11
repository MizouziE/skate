import { grooveGrinds } from '../../data/groove-grinds.js';
import { soulGrinds } from '../../data/soul-grinds.js';
import { specialNameGrinds } from '../../data/special-name-grinds.js';
import { variations } from '../../data/variations.js';
import { saveCustomSelections, clearCustomSelections } from './db.js';

export { loadCustomSelections, saveCustomSelections } from './db.js';

// ── Modal state ────────────────────────────────────────────────────────────

let modalPage = 0;
let modalDraft = { tricks: new Set(), variations: new Set(), variationsEnabled: false };

const MODAL_PAGES = [
  { title: 'Groove Grinds',       data: grooveGrinds },
  { title: 'Soul Grinds',         data: soulGrinds },
  { title: 'Special Name Grinds', data: specialNameGrinds },
  { title: 'Variations',          data: variations, isVariations: true },
];

// ── Custom mode helpers ────────────────────────────────────────────────────

export function applyCustomMode(state, record) {
  const allTricks = [...grooveGrinds, ...soulGrinds, ...specialNameGrinds];
  state.customTricks = allTricks.filter(t => record.tricks.includes(t.label));
  state.customVariations = variations.filter(v => record.variations.includes(v.label));
  state.customVariationsEnabled = record.variationsEnabled;
  state.customMode = true;

  document.querySelector('#customModeBar').hidden = false;
  document.querySelector('#listSelector').classList.add('disabled');
  document.querySelector('#variations-toggle').disabled = true;
}

function disableCustomMode(state) {
  state.customMode = false;
  state.customTricks = [];
  state.customVariations = [];
  state.customVariationsEnabled = false;

  document.querySelector('#customModeBar').hidden = true;
  document.querySelector('#listSelector').classList.remove('disabled');
  document.querySelector('#variations-toggle').disabled = false;
}

// ── Modal UI ───────────────────────────────────────────────────────────────

function openModal(state) {
  if (state.customMode) {
    modalDraft.tricks = new Set(state.customTricks.map(t => t.label));
    modalDraft.variations = new Set(state.customVariations.map(v => v.label));
    modalDraft.variationsEnabled = state.customVariationsEnabled;
  } else {
    modalDraft.tricks = new Set();
    modalDraft.variations = new Set();
    modalDraft.variationsEnabled = false;
  }
  modalPage = 0;
  document.querySelector('#trickModal').hidden = false;
  document.body.style.overflow = 'hidden';
  renderModalPage();
}

function closeModal() {
  document.querySelector('#trickModal').hidden = true;
  document.body.style.overflow = '';
  document.querySelector('#modalError').hidden = true;
}

function renderModalPage() {
  const page = MODAL_PAGES[modalPage];
  document.querySelector('#modalTitle').textContent = page.title;
  document.querySelector('#modalPage').textContent = `(${modalPage + 1}/${MODAL_PAGES.length})`;

  document.querySelector('#modalPrev').style.visibility = modalPage === 0 ? 'hidden' : 'visible';
  document.querySelector('#modalNext').textContent = modalPage === MODAL_PAGES.length - 1 ? 'Save' : 'Next →';

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

  const modalListEl = document.querySelector('#modalList');
  modalListEl.innerHTML = html;
  modalListEl.scrollTop = 0;
  document.querySelector('#modalError').hidden = true;

  if (page.isVariations) {
    modalListEl.querySelector('#varToggle').addEventListener('change', e => {
      modalDraft.variationsEnabled = e.target.checked;
    });
  }

  modalListEl.querySelectorAll('.modal-item-cb').forEach(cb => {
    cb.addEventListener('change', e => {
      const set = page.isVariations ? modalDraft.variations : modalDraft.tricks;
      if (e.target.checked) set.add(e.target.dataset.label);
      else set.delete(e.target.dataset.label);
    });
  });
}

async function handleModalSave(state) {
  if (modalDraft.tricks.size === 0) {
    document.querySelector('#modalError').hidden = false;
    return;
  }
  const record = {
    tricks: [...modalDraft.tricks],
    variations: [...modalDraft.variations],
    variationsEnabled: modalDraft.variationsEnabled,
    history: state.sessionHistory,
  };
  await saveCustomSelections(record);
  applyCustomMode(state, record);
  closeModal();
  state.excluded.clear();
  state.lastLanded = null;
  state.rebuildSectors();
  state.drawWheel();
  state.rotate();
}

async function handleClearCustom(state) {
  await clearCustomSelections();
  disableCustomMode(state);
  state.excluded.clear();
  state.lastLanded = null;
  state.rebuildSectors();
  state.drawWheel();
  state.rotate();
}

export function initTrickModal(state) {
  document.querySelector('#customizeBtn').addEventListener('click', () => openModal(state));
  document.querySelector('#clearCustom').addEventListener('click', () => handleClearCustom(state));
  document.querySelector('#modalClose').addEventListener('click', closeModal);
  document.querySelector('#modalBackdrop').addEventListener('click', closeModal);

  document.querySelector('#modalPrev').addEventListener('click', () => {
    if (modalPage > 0) {
      modalPage--;
      renderModalPage();
    }
  });

  document.querySelector('#modalNext').addEventListener('click', () => {
    if (modalPage < MODAL_PAGES.length - 1) {
      modalPage++;
      renderModalPage();
    } else {
      handleModalSave(state);
    }
  });

  document.querySelector('#selectAll').addEventListener('click', () => {
    const page = MODAL_PAGES[modalPage];
    const set = page.isVariations ? modalDraft.variations : modalDraft.tricks;
    page.data.forEach(item => set.add(item.label));
    document.querySelectorAll('.modal-item-cb').forEach(cb => { cb.checked = true; });
  });

  document.querySelector('#selectNone').addEventListener('click', () => {
    const page = MODAL_PAGES[modalPage];
    const set = page.isVariations ? modalDraft.variations : modalDraft.tricks;
    page.data.forEach(item => set.delete(item.label));
    document.querySelectorAll('.modal-item-cb').forEach(cb => { cb.checked = false; });
  });
}
