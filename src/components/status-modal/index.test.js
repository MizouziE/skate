import { expect } from '@esm-bundle/chai';
import { initStatusModal } from './index.js';
import { statusModalTemplate } from './template.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeState() {
	const state = {
		sessionHistory: [{ label: 'Unity', color: '#ff0000', status: 'landed' }],
		getTextColor: (_) => '#ffffff',
		renderHistory: () => {
			makeState._calls.renderHistory++;
		},
		saveWithHistory: () => {
			makeState._calls.saveWithHistory++;
		},
	};
	return state;
}
makeState._calls = { renderHistory: 0, saveWithHistory: 0 };

function mountTemplate() {
	const host = document.createElement('div');
	host.innerHTML = statusModalTemplate;
	document.body.appendChild(host);
	return host;
}

function unmount(host) {
	document.body.removeChild(host);
}

function clickBackdrop() {
	document.querySelector('#statusBackdrop').dispatchEvent(new Event('click'));
}

// ---------------------------------------------------------------------------
// Template structure
// ---------------------------------------------------------------------------

describe('statusModalTemplate', () => {
	it('contains #statusModal', () => {
		const host = mountTemplate();
		expect(host.querySelector('#statusModal')).to.exist;
		unmount(host);
	});

	it('contains #statusBackdrop', () => {
		const host = mountTemplate();
		expect(host.querySelector('#statusBackdrop')).to.exist;
		unmount(host);
	});

	it('contains #statusTrickLabel', () => {
		const host = mountTemplate();
		expect(host.querySelector('#statusTrickLabel')).to.exist;
		unmount(host);
	});

	it('contains #btnLanded', () => {
		const host = mountTemplate();
		expect(host.querySelector('#btnLanded')).to.exist;
		unmount(host);
	});

	it('contains #btnMissed', () => {
		const host = mountTemplate();
		expect(host.querySelector('#btnMissed')).to.exist;
		unmount(host);
	});

	it('contains #btnSkip', () => {
		const host = mountTemplate();
		expect(host.querySelector('#btnSkip')).to.exist;
		unmount(host);
	});
});

// ---------------------------------------------------------------------------
// initStatusModal — setup
// ---------------------------------------------------------------------------

describe('initStatusModal — setup', () => {
	let host, state;

	beforeEach(() => {
		makeState._calls = { renderHistory: 0, saveWithHistory: 0 };
		host = mountTemplate();
		state = makeState();
		initStatusModal(state);
	});

	afterEach(() => {
		clickBackdrop();
		unmount(host);
	});

	it('attaches openStatusModal to state', () => {
		expect(state.openStatusModal).to.be.a('function');
	});
});

// ---------------------------------------------------------------------------
// openStatusModal
// ---------------------------------------------------------------------------

describe('initStatusModal — openStatusModal', () => {
	let host, state;

	beforeEach(() => {
		makeState._calls = { renderHistory: 0, saveWithHistory: 0 };
		host = mountTemplate();
		state = makeState();
		initStatusModal(state);
	});

	afterEach(() => {
		clickBackdrop();
		unmount(host);
	});

	it('sets #statusTrickLabel textContent to the trick label', () => {
		state.openStatusModal(0);
		expect(document.querySelector('#statusTrickLabel').textContent).to.equal('Unity');
	});

	it('sets #statusTrickLabel background to the trick color', () => {
		state.openStatusModal(0);
		expect(document.querySelector('#statusTrickLabel').style.background).to.equal(
			'rgb(255, 0, 0)'
		);
	});

	it('sets #statusTrickLabel color to getTextColor result', () => {
		state.openStatusModal(0);
		expect(document.querySelector('#statusTrickLabel').style.color).to.equal('rgb(255, 255, 255)');
	});

	it('shows #statusModal (hidden = false)', () => {
		state.openStatusModal(0);
		expect(document.querySelector('#statusModal').hidden).to.equal(false);
	});
});

// ---------------------------------------------------------------------------
// Backdrop click — closeStatusModal
// ---------------------------------------------------------------------------

describe('initStatusModal — backdrop click', () => {
	let host, state;

	beforeEach(() => {
		makeState._calls = { renderHistory: 0, saveWithHistory: 0 };
		host = mountTemplate();
		state = makeState();
		initStatusModal(state);
		state.openStatusModal(0);
	});

	afterEach(() => unmount(host));

	it('hides #statusModal on backdrop click', () => {
		clickBackdrop();
		expect(document.querySelector('#statusModal').hidden).to.equal(true);
	});

	it('resets statusModalIdx so subsequent button click is no-op', () => {
		clickBackdrop();
		document.querySelector('#btnLanded').dispatchEvent(new Event('click'));
		expect(makeState._calls.renderHistory).to.equal(0);
	});
});

// ---------------------------------------------------------------------------
// Button clicks — applyStatus
// ---------------------------------------------------------------------------

describe('initStatusModal — btnLanded click', () => {
	let host, state;

	beforeEach(() => {
		makeState._calls = { renderHistory: 0, saveWithHistory: 0 };
		host = mountTemplate();
		state = makeState();
		initStatusModal(state);
		state.openStatusModal(0);
	});

	afterEach(() => unmount(host));

	it('sets status to "landed"', () => {
		document.querySelector('#btnLanded').dispatchEvent(new Event('click'));
		expect(state.sessionHistory[0].status).to.equal('landed');
	});

	it('calls renderHistory', () => {
		document.querySelector('#btnLanded').dispatchEvent(new Event('click'));
		expect(makeState._calls.renderHistory).to.equal(1);
	});

	it('calls saveWithHistory', () => {
		document.querySelector('#btnLanded').dispatchEvent(new Event('click'));
		expect(makeState._calls.saveWithHistory).to.equal(1);
	});

	it('closes modal', () => {
		document.querySelector('#btnLanded').dispatchEvent(new Event('click'));
		expect(document.querySelector('#statusModal').hidden).to.equal(true);
	});
});

describe('initStatusModal — btnMissed click', () => {
	let host, state;

	beforeEach(() => {
		makeState._calls = { renderHistory: 0, saveWithHistory: 0 };
		host = mountTemplate();
		state = makeState();
		initStatusModal(state);
		state.openStatusModal(0);
	});

	afterEach(() => unmount(host));

	it('sets status to "missed"', () => {
		document.querySelector('#btnMissed').dispatchEvent(new Event('click'));
		expect(state.sessionHistory[0].status).to.equal('missed');
	});

	it('calls renderHistory', () => {
		document.querySelector('#btnMissed').dispatchEvent(new Event('click'));
		expect(makeState._calls.renderHistory).to.equal(1);
	});

	it('calls saveWithHistory', () => {
		document.querySelector('#btnMissed').dispatchEvent(new Event('click'));
		expect(makeState._calls.saveWithHistory).to.equal(1);
	});

	it('closes modal', () => {
		document.querySelector('#btnMissed').dispatchEvent(new Event('click'));
		expect(document.querySelector('#statusModal').hidden).to.equal(true);
	});
});

describe('initStatusModal — btnSkip click', () => {
	let host, state;

	beforeEach(() => {
		makeState._calls = { renderHistory: 0, saveWithHistory: 0 };
		host = mountTemplate();
		state = makeState();
		initStatusModal(state);
		state.openStatusModal(0);
	});

	afterEach(() => unmount(host));

	it('sets status to "skipped"', () => {
		document.querySelector('#btnSkip').dispatchEvent(new Event('click'));
		expect(state.sessionHistory[0].status).to.equal('skipped');
	});

	it('calls renderHistory', () => {
		document.querySelector('#btnSkip').dispatchEvent(new Event('click'));
		expect(makeState._calls.renderHistory).to.equal(1);
	});

	it('calls saveWithHistory', () => {
		document.querySelector('#btnSkip').dispatchEvent(new Event('click'));
		expect(makeState._calls.saveWithHistory).to.equal(1);
	});

	it('closes modal', () => {
		document.querySelector('#btnSkip').dispatchEvent(new Event('click'));
		expect(document.querySelector('#statusModal').hidden).to.equal(true);
	});
});

// ---------------------------------------------------------------------------
// Guard branch — applyStatus with no open modal
// ---------------------------------------------------------------------------

describe('initStatusModal — guard branch (no open modal)', () => {
	let host, state;

	beforeEach(() => {
		makeState._calls = { renderHistory: 0, saveWithHistory: 0 };
		host = mountTemplate();
		state = makeState();
		initStatusModal(state);
		// intentionally do NOT call openStatusModal — statusModalIdx stays -1
	});

	afterEach(() => unmount(host));

	it('does NOT call renderHistory when btnLanded clicked without opening', () => {
		document.querySelector('#btnLanded').dispatchEvent(new Event('click'));
		expect(makeState._calls.renderHistory).to.equal(0);
	});

	it('does NOT call saveWithHistory when btnLanded clicked without opening', () => {
		document.querySelector('#btnLanded').dispatchEvent(new Event('click'));
		expect(makeState._calls.saveWithHistory).to.equal(0);
	});
});
