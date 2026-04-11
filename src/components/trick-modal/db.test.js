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
