import { expect } from '@esm-bundle/chai';
import {
	loadCustomSelections,
	saveCustomSelections,
	clearCustomSelections,
} from './db.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function clean() {
	await clearCustomSelections();
}

// ---------------------------------------------------------------------------
// loadCustomSelections — nothing saved
// ---------------------------------------------------------------------------

describe('loadCustomSelections — nothing saved', () => {
	beforeEach(clean);
	afterEach(clean);

	it('returns null when store is empty', async () => {
		const result = await loadCustomSelections();
		expect(result).to.equal(null);
	});
});

// ---------------------------------------------------------------------------
// saveCustomSelections + loadCustomSelections
// ---------------------------------------------------------------------------

describe('saveCustomSelections + loadCustomSelections', () => {
	beforeEach(clean);
	afterEach(clean);

	it('round-trips tricks array', async () => {
		await saveCustomSelections({ tricks: ['Frontside'], variations: [], variationsEnabled: false, history: [] });
		const loaded = await loadCustomSelections();
		expect(loaded.tricks).to.deep.equal(['Frontside']);
	});

	it('round-trips variations array', async () => {
		await saveCustomSelections({ tricks: ['Frontside'], variations: ['Truespin'], variationsEnabled: true, history: [] });
		const loaded = await loadCustomSelections();
		expect(loaded.variations).to.deep.equal(['Truespin']);
	});

	it('round-trips variationsEnabled', async () => {
		await saveCustomSelections({ tricks: ['Frontside'], variations: [], variationsEnabled: true, history: [] });
		const loaded = await loadCustomSelections();
		expect(loaded.variationsEnabled).to.equal(true);
	});

	it('overwrites a previous save', async () => {
		await saveCustomSelections({ tricks: ['Frontside'], variations: [], variationsEnabled: false, history: [] });
		await saveCustomSelections({ tricks: ['Backside'], variations: [], variationsEnabled: false, history: [] });
		const loaded = await loadCustomSelections();
		expect(loaded.tricks).to.deep.equal(['Backside']);
	});
});

// ---------------------------------------------------------------------------
// clearCustomSelections
// ---------------------------------------------------------------------------

describe('clearCustomSelections', () => {
	beforeEach(clean);

	it('returns null on load after clear', async () => {
		await saveCustomSelections({ tricks: ['Frontside'], variations: [], variationsEnabled: false, history: [] });
		await clearCustomSelections();
		const loaded = await loadCustomSelections();
		expect(loaded).to.equal(null);
	});

	it('is a no-op when store is already empty', async () => {
		await clearCustomSelections(); // should not throw
		const loaded = await loadCustomSelections();
		expect(loaded).to.equal(null);
	});
});

// ---------------------------------------------------------------------------
// Failure paths — IDB unavailable
// ---------------------------------------------------------------------------

const origOpen = IDBFactory.prototype.open;

function stubOpenToFail() {
	const err = new DOMException('Simulated IDB failure');
	IDBFactory.prototype.open = function () {
		const req = { error: err };
		setTimeout(() => { if (req.onerror) req.onerror({ target: req }); }, 0);
		return req;
	};
}

function restoreOpen() {
	IDBFactory.prototype.open = origOpen;
}

describe('loadCustomSelections — IDB failure', () => {
	beforeEach(stubOpenToFail);
	afterEach(restoreOpen);

	it('returns fallback object', async () => {
		const result = await loadCustomSelections();
		expect(result).to.deep.equal({ tricks: [], variations: [], enabled: false });
	});
});

describe('saveCustomSelections — IDB failure', () => {
	beforeEach(stubOpenToFail);
	afterEach(restoreOpen);

	it('does not throw', async () => {
		await saveCustomSelections({ tricks: ['Frontside'], variations: [], variationsEnabled: false, history: [] });
	});
});

describe('clearCustomSelections — IDB failure', () => {
	beforeEach(stubOpenToFail);
	afterEach(restoreOpen);

	it('does not throw', async () => {
		await clearCustomSelections();
	});
});
