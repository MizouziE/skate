// ── IndexedDB ──────────────────────────────────────────────────────────────

function openDB() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open('bladeDB', 1);
		req.onupgradeneeded = (e) => {
			e.target.result.createObjectStore('userSelections', { keyPath: 'id' });
		};
		req.onsuccess = (e) => resolve(e.target.result);
		req.onerror = (e) => reject(e.target.error);
	});
}

export async function loadCustomSelections() {
	try {
		const db = await openDB();
		return await new Promise((resolve, reject) => {
			const tx = db.transaction('userSelections', 'readonly');
			const req = tx.objectStore('userSelections').get('main');
			req.onsuccess = (e) => resolve(e.target.result ?? null);
			req.onerror = (e) => reject(e.target.error);
		});
	} catch (err) {
		console.warn('loadCustomSelections failed:', err);
		return { tricks: [], variations: [], enabled: false };
	}
}

export async function saveCustomSelections(data) {
	try {
		const db = await openDB();
		await new Promise((resolve, reject) => {
			const tx = db.transaction('userSelections', 'readwrite');
			const req = tx.objectStore('userSelections').put({ id: 'main', ...data });
			req.onsuccess = () => resolve();
			req.onerror = (e) => reject(e.target.error);
		});
	} catch (err) {
		console.warn('saveCustomSelections failed:', err);
	}
}

export async function clearCustomSelections() {
	try {
		const db = await openDB();
		await new Promise((resolve, reject) => {
			const tx = db.transaction('userSelections', 'readwrite');
			const req = tx.objectStore('userSelections').delete('main');
			req.onsuccess = () => resolve();
			req.onerror = (e) => reject(e.target.error);
		});
	} catch (err) {
		console.warn('clearCustomSelections failed:', err);
	}
}
