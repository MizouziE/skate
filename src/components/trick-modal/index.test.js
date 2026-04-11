import { expect } from '@esm-bundle/chai';
import { applyCustomMode, initTrickModal } from './index.js';
import { clearCustomSelections } from './db.js';
import { trickModalTemplate } from './template.js';
import { grooveGrinds } from '../../data/groove-grinds.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeState() {
	const state = {
		excluded: new Set(['x']),
		lastLanded: 'some-trick',
		sessionHistory: [],
		customMode: false,
		customTricks: [],
		customVariations: [],
		customVariationsEnabled: false,
		rebuildSectors: () => { makeState._calls.rebuildSectors++; },
		drawWheel: () => { makeState._calls.drawWheel++; },
		rotate: () => { makeState._calls.rotate++; },
	};
	return state;
}
makeState._calls = { rebuildSectors: 0, drawWheel: 0, rotate: 0 };

function mountAll() {
	const host = document.createElement('div');
	host.innerHTML = trickModalTemplate + `
		<button id="customizeBtn"></button>
		<button id="clearCustom"></button>
		<div id="customModeBar" hidden></div>
		<div id="listSelector"></div>
		<input type="checkbox" id="variations-toggle">
	`;
	document.body.appendChild(host);
	return host;
}

function unmount(host) {
	document.body.removeChild(host);
}

function clickEl(selector) {
	document.querySelector(selector).dispatchEvent(new Event('click'));
}

function openModal() {
	clickEl('#customizeBtn');
}

function closeModal() {
	clickEl('#modalBackdrop');
}

// ---------------------------------------------------------------------------
// trickModalTemplate — structure
// ---------------------------------------------------------------------------

describe('trickModalTemplate', () => {
	it('contains #trickModal', () => {
		const host = mountAll();
		expect(host.querySelector('#trickModal')).to.exist;
		unmount(host);
	});

	it('contains #modalBackdrop', () => {
		const host = mountAll();
		expect(host.querySelector('#modalBackdrop')).to.exist;
		unmount(host);
	});

	it('contains #modalTitle', () => {
		const host = mountAll();
		expect(host.querySelector('#modalTitle')).to.exist;
		unmount(host);
	});

	it('contains #modalPage', () => {
		const host = mountAll();
		expect(host.querySelector('#modalPage')).to.exist;
		unmount(host);
	});

	it('contains #modalList', () => {
		const host = mountAll();
		expect(host.querySelector('#modalList')).to.exist;
		unmount(host);
	});

	it('contains #modalError hidden by default', () => {
		const host = mountAll();
		expect(host.querySelector('#modalError').hidden).to.equal(true);
		unmount(host);
	});

	it('contains #modalClose', () => {
		const host = mountAll();
		expect(host.querySelector('#modalClose')).to.exist;
		unmount(host);
	});

	it('contains #selectAll', () => {
		const host = mountAll();
		expect(host.querySelector('#selectAll')).to.exist;
		unmount(host);
	});

	it('contains #selectNone', () => {
		const host = mountAll();
		expect(host.querySelector('#selectNone')).to.exist;
		unmount(host);
	});

	it('contains #modalPrev', () => {
		const host = mountAll();
		expect(host.querySelector('#modalPrev')).to.exist;
		unmount(host);
	});

	it('contains #modalNext', () => {
		const host = mountAll();
		expect(host.querySelector('#modalNext')).to.exist;
		unmount(host);
	});
});

// ---------------------------------------------------------------------------
// applyCustomMode
// ---------------------------------------------------------------------------

describe('applyCustomMode', () => {
	let host, state;

	beforeEach(() => {
		host = mountAll();
		state = makeState();
	});

	afterEach(() => unmount(host));

	const record = {
		tricks: [grooveGrinds[0].label],
		variations: [],
		variationsEnabled: true,
	};

	it('sets state.customMode to true', () => {
		applyCustomMode(state, record);
		expect(state.customMode).to.equal(true);
	});

	it('sets state.customTricks to matching tricks', () => {
		applyCustomMode(state, record);
		expect(state.customTricks.length).to.equal(1);
		expect(state.customTricks[0].label).to.equal(grooveGrinds[0].label);
	});

	it('sets state.customVariations to empty array when none match', () => {
		applyCustomMode(state, record);
		expect(state.customVariations.length).to.equal(0);
	});

	it('sets state.customVariationsEnabled from record', () => {
		applyCustomMode(state, record);
		expect(state.customVariationsEnabled).to.equal(true);
	});

	it('shows #customModeBar', () => {
		applyCustomMode(state, record);
		expect(document.querySelector('#customModeBar').hidden).to.equal(false);
	});

	it('adds "disabled" class to #listSelector', () => {
		applyCustomMode(state, record);
		expect(document.querySelector('#listSelector').classList.contains('disabled')).to.equal(true);
	});

	it('disables #variations-toggle', () => {
		applyCustomMode(state, record);
		expect(document.querySelector('#variations-toggle').disabled).to.equal(true);
	});
});

// ---------------------------------------------------------------------------
// initTrickModal — openModal via #customizeBtn
// ---------------------------------------------------------------------------

describe('initTrickModal — openModal', () => {
	let host, state;

	beforeEach(() => {
		makeState._calls = { rebuildSectors: 0, drawWheel: 0, rotate: 0 };
		host = mountAll();
		state = makeState();
		initTrickModal(state);
		openModal();
	});

	afterEach(() => {
		closeModal();
		unmount(host);
	});

	it('shows #trickModal', () => {
		expect(document.querySelector('#trickModal').hidden).to.equal(false);
	});

	it('sets body overflow to hidden', () => {
		expect(document.body.style.overflow).to.equal('hidden');
	});

	it('sets #modalTitle to "Groove Grinds"', () => {
		expect(document.querySelector('#modalTitle').textContent).to.equal('Groove Grinds');
	});

	it('sets #modalPage to "(1/4)"', () => {
		expect(document.querySelector('#modalPage').textContent).to.equal('(1/4)');
	});

	it('hides #modalPrev on first page', () => {
		expect(document.querySelector('#modalPrev').style.visibility).to.equal('hidden');
	});

	it('sets #modalNext text to "Next →"', () => {
		expect(document.querySelector('#modalNext').textContent).to.equal('Next →');
	});
});

// ---------------------------------------------------------------------------
// closeModal — via #modalClose
// ---------------------------------------------------------------------------

describe('initTrickModal — closeModal via #modalClose', () => {
	let host, state;

	beforeEach(() => {
		host = mountAll();
		state = makeState();
		initTrickModal(state);
		openModal();
	});

	afterEach(() => unmount(host));

	it('hides #trickModal', () => {
		clickEl('#modalClose');
		expect(document.querySelector('#trickModal').hidden).to.equal(true);
	});

	it('resets body overflow', () => {
		clickEl('#modalClose');
		expect(document.body.style.overflow).to.equal('');
	});
});

// ---------------------------------------------------------------------------
// closeModal — via #modalBackdrop
// ---------------------------------------------------------------------------

describe('initTrickModal — closeModal via #modalBackdrop', () => {
	let host, state;

	beforeEach(() => {
		host = mountAll();
		state = makeState();
		initTrickModal(state);
		openModal();
	});

	afterEach(() => unmount(host));

	it('hides #trickModal', () => {
		closeModal();
		expect(document.querySelector('#trickModal').hidden).to.equal(true);
	});

	it('resets body overflow', () => {
		closeModal();
		expect(document.body.style.overflow).to.equal('');
	});
});

// ---------------------------------------------------------------------------
// renderModalPage — page navigation
// ---------------------------------------------------------------------------

describe('initTrickModal — page navigation', () => {
	let host, state;

	beforeEach(() => {
		host = mountAll();
		state = makeState();
		initTrickModal(state);
		openModal();
	});

	afterEach(() => {
		closeModal();
		unmount(host);
	});

	it('#modalNext advances to Soul Grinds', () => {
		clickEl('#modalNext');
		expect(document.querySelector('#modalTitle').textContent).to.equal('Soul Grinds');
	});

	it('#modalPage counter updates on advance', () => {
		clickEl('#modalNext');
		expect(document.querySelector('#modalPage').textContent).to.equal('(2/4)');
	});

	it('#modalPrev becomes visible after advancing', () => {
		clickEl('#modalNext');
		expect(document.querySelector('#modalPrev').style.visibility).to.equal('visible');
	});

	it('#modalPrev returns to Groove Grinds', () => {
		clickEl('#modalNext');
		clickEl('#modalPrev');
		expect(document.querySelector('#modalTitle').textContent).to.equal('Groove Grinds');
	});

	it('#modalPrev is hidden again on page 0', () => {
		clickEl('#modalNext');
		clickEl('#modalPrev');
		expect(document.querySelector('#modalPrev').style.visibility).to.equal('hidden');
	});

	it('#modalNext text changes to "Save" on last page', () => {
		clickEl('#modalNext');
		clickEl('#modalNext');
		clickEl('#modalNext');
		expect(document.querySelector('#modalNext').textContent).to.equal('Save');
	});
});

// ---------------------------------------------------------------------------
// #selectAll / #selectNone
// ---------------------------------------------------------------------------

describe('initTrickModal — selectAll / selectNone', () => {
	let host, state;

	beforeEach(() => {
		host = mountAll();
		state = makeState();
		initTrickModal(state);
		openModal(); // page 0, Groove Grinds
	});

	afterEach(() => {
		closeModal();
		unmount(host);
	});

	it('#selectAll checks all .modal-item-cb', () => {
		clickEl('#selectAll');
		const cbs = [...document.querySelectorAll('.modal-item-cb')];
		expect(cbs.length).to.be.greaterThan(0);
		expect(cbs.every((cb) => cb.checked)).to.equal(true);
	});

	it('#selectNone unchecks all .modal-item-cb', () => {
		clickEl('#selectAll');
		clickEl('#selectNone');
		const cbs = [...document.querySelectorAll('.modal-item-cb')];
		expect(cbs.every((cb) => !cb.checked)).to.equal(true);
	});

	it('#selectAll then #selectNone leaves all unchecked', () => {
		clickEl('#selectAll');
		clickEl('#selectNone');
		expect([...document.querySelectorAll('.modal-item-cb')].every((cb) => !cb.checked)).to.equal(true);
	});
});

// ---------------------------------------------------------------------------
// checkbox change — draft persistence across page navigation
// ---------------------------------------------------------------------------

describe('initTrickModal — checkbox draft persistence', () => {
	let host, state;

	beforeEach(() => {
		host = mountAll();
		state = makeState();
		initTrickModal(state);
		openModal(); // page 0
	});

	afterEach(() => {
		closeModal();
		unmount(host);
	});

	it('checked item stays checked after navigating away and back', () => {
		const cb = document.querySelector('.modal-item-cb');
		cb.checked = true;
		cb.dispatchEvent(new Event('change'));
		const label = cb.dataset.label;

		clickEl('#modalNext'); // page 1
		clickEl('#modalPrev'); // back to page 0

		const same = document.querySelector(`.modal-item-cb[data-label="${label}"]`);
		expect(same.checked).to.equal(true);
	});

	it('unchecked item stays unchecked after navigating away and back', () => {
		// first check it
		const cb = document.querySelector('.modal-item-cb');
		cb.checked = true;
		cb.dispatchEvent(new Event('change'));
		const label = cb.dataset.label;

		// now uncheck it
		cb.checked = false;
		cb.dispatchEvent(new Event('change'));

		clickEl('#modalNext');
		clickEl('#modalPrev');

		const same = document.querySelector(`.modal-item-cb[data-label="${label}"]`);
		expect(same.checked).to.equal(false);
	});
});

// ---------------------------------------------------------------------------
// varToggle — draft persistence
// ---------------------------------------------------------------------------

describe('initTrickModal — varToggle persistence', () => {
	let host, state;

	beforeEach(() => {
		host = mountAll();
		state = makeState();
		initTrickModal(state);
		openModal();
		// navigate to page 4 (Variations)
		clickEl('#modalNext');
		clickEl('#modalNext');
		clickEl('#modalNext');
	});

	afterEach(() => {
		closeModal();
		unmount(host);
	});

	it('#varToggle is unchecked by default', () => {
		expect(document.querySelector('#varToggle').checked).to.equal(false);
	});

	it('checked #varToggle persists after navigating away and back', () => {
		const tog = document.querySelector('#varToggle');
		tog.checked = true;
		tog.dispatchEvent(new Event('change'));

		clickEl('#modalPrev'); // page 3
		clickEl('#modalNext'); // back to page 4

		expect(document.querySelector('#varToggle').checked).to.equal(true);
	});
});

// ---------------------------------------------------------------------------
// handleModalSave — validation error
// ---------------------------------------------------------------------------

describe('initTrickModal — handleModalSave validation error', () => {
	let host, state;

	beforeEach(() => {
		host = mountAll();
		state = makeState();
		initTrickModal(state);
		openModal();
		// navigate to last page without adding tricks
		clickEl('#modalNext');
		clickEl('#modalNext');
		clickEl('#modalNext');
	});

	afterEach(() => {
		closeModal();
		unmount(host);
	});

	it('shows #modalError when no tricks selected', () => {
		clickEl('#modalNext'); // triggers handleModalSave
		expect(document.querySelector('#modalError').hidden).to.equal(false);
	});

	it('keeps modal open when validation fails', () => {
		clickEl('#modalNext');
		expect(document.querySelector('#trickModal').hidden).to.equal(false);
	});
});

// ---------------------------------------------------------------------------
// handleModalSave — success (async, real IDB)
// ---------------------------------------------------------------------------

describe('initTrickModal — handleModalSave success', () => {
	let host, state;

	beforeEach(() => {
		makeState._calls = { rebuildSectors: 0, drawWheel: 0, rotate: 0 };
		host = mountAll();
		state = makeState();
		initTrickModal(state);
		openModal(); // page 0
	});

	afterEach(async () => {
		await clearCustomSelections();
		unmount(host);
	});

	it('calls rebuildSectors, drawWheel, rotate and closes modal', async () => {
		clickEl('#selectAll'); // add all groove grinds to draft
		clickEl('#modalNext'); // page 1
		clickEl('#modalNext'); // page 2
		clickEl('#modalNext'); // page 3 (Variations)
		clickEl('#modalNext'); // triggers handleModalSave (Save)

		await new Promise((r) => setTimeout(r, 100));

		expect(makeState._calls.rebuildSectors).to.equal(1);
		expect(makeState._calls.drawWheel).to.equal(1);
		expect(makeState._calls.rotate).to.equal(1);
	});

	it('clears state.excluded', async () => {
		clickEl('#selectAll');
		clickEl('#modalNext');
		clickEl('#modalNext');
		clickEl('#modalNext');
		clickEl('#modalNext');

		await new Promise((r) => setTimeout(r, 100));

		expect(state.excluded.size).to.equal(0);
	});

	it('sets state.lastLanded to null', async () => {
		clickEl('#selectAll');
		clickEl('#modalNext');
		clickEl('#modalNext');
		clickEl('#modalNext');
		clickEl('#modalNext');

		await new Promise((r) => setTimeout(r, 100));

		expect(state.lastLanded).to.equal(null);
	});

	it('sets state.customMode to true', async () => {
		clickEl('#selectAll');
		clickEl('#modalNext');
		clickEl('#modalNext');
		clickEl('#modalNext');
		clickEl('#modalNext');

		await new Promise((r) => setTimeout(r, 100));

		expect(state.customMode).to.equal(true);
	});

	it('closes #trickModal', async () => {
		clickEl('#selectAll');
		clickEl('#modalNext');
		clickEl('#modalNext');
		clickEl('#modalNext');
		clickEl('#modalNext');

		await new Promise((r) => setTimeout(r, 100));

		expect(document.querySelector('#trickModal').hidden).to.equal(true);
	});
});

// ---------------------------------------------------------------------------
// handleClearCustom (async, real IDB)
// ---------------------------------------------------------------------------

describe('initTrickModal — handleClearCustom', () => {
	let host, state;

	beforeEach(() => {
		makeState._calls = { rebuildSectors: 0, drawWheel: 0, rotate: 0 };
		host = mountAll();
		// put DOM in "custom mode" state
		document.querySelector('#customModeBar').hidden = false;
		document.querySelector('#listSelector').classList.add('disabled');
		document.querySelector('#variations-toggle').disabled = true;

		state = makeState();
		state.customMode = true;
		initTrickModal(state);
	});

	afterEach(() => unmount(host));

	it('calls rebuildSectors', async () => {
		clickEl('#clearCustom');
		await new Promise((r) => setTimeout(r, 100));
		expect(makeState._calls.rebuildSectors).to.equal(1);
	});

	it('calls drawWheel', async () => {
		clickEl('#clearCustom');
		await new Promise((r) => setTimeout(r, 100));
		expect(makeState._calls.drawWheel).to.equal(1);
	});

	it('calls rotate', async () => {
		clickEl('#clearCustom');
		await new Promise((r) => setTimeout(r, 100));
		expect(makeState._calls.rotate).to.equal(1);
	});

	it('clears state.excluded', async () => {
		clickEl('#clearCustom');
		await new Promise((r) => setTimeout(r, 100));
		expect(state.excluded.size).to.equal(0);
	});

	it('sets state.lastLanded to null', async () => {
		clickEl('#clearCustom');
		await new Promise((r) => setTimeout(r, 100));
		expect(state.lastLanded).to.equal(null);
	});

	it('sets state.customMode to false', async () => {
		clickEl('#clearCustom');
		await new Promise((r) => setTimeout(r, 100));
		expect(state.customMode).to.equal(false);
	});

	it('hides #customModeBar', async () => {
		clickEl('#clearCustom');
		await new Promise((r) => setTimeout(r, 100));
		expect(document.querySelector('#customModeBar').hidden).to.equal(true);
	});

	it('removes "disabled" class from #listSelector', async () => {
		clickEl('#clearCustom');
		await new Promise((r) => setTimeout(r, 100));
		expect(document.querySelector('#listSelector').classList.contains('disabled')).to.equal(false);
	});

	it('re-enables #variations-toggle', async () => {
		clickEl('#clearCustom');
		await new Promise((r) => setTimeout(r, 100));
		expect(document.querySelector('#variations-toggle').disabled).to.equal(false);
	});
});
