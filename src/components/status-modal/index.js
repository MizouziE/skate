// ── Status modal state ─────────────────────────────────────────────────────

let statusModalIdx = -1;

// ── Status modal UI ────────────────────────────────────────────────────────

function openStatusModal(state, idx) {
	statusModalIdx = idx;
	const h = state.sessionHistory[idx];
	const labelEl = document.querySelector('#statusTrickLabel');
	labelEl.textContent = h.label;
	labelEl.style.background = h.color;
	labelEl.style.color = state.getTextColor(h.color);
	document.querySelector('#statusModal').hidden = false;
}

function closeStatusModal() {
	document.querySelector('#statusModal').hidden = true;
	statusModalIdx = -1;
}

function applyStatus(state, status) {
	if (statusModalIdx < 0) return;
	state.sessionHistory[statusModalIdx].status = status;
	state.renderHistory();
	state.saveWithHistory();
	closeStatusModal();
}

export function initStatusModal(state) {
	// Expose openStatusModal via state for skate.js event listeners
	state.openStatusModal = (idx) => openStatusModal(state, idx);

	document
		.querySelector('#statusBackdrop')
		.addEventListener('click', closeStatusModal);
	document
		.querySelector('#btnLanded')
		.addEventListener('click', () => applyStatus(state, 'landed'));
	document
		.querySelector('#btnMissed')
		.addEventListener('click', () => applyStatus(state, 'missed'));
	document
		.querySelector('#btnSkip')
		.addEventListener('click', () => applyStatus(state, 'skipped'));
}
