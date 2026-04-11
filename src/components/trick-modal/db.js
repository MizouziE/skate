// ── IndexedDB ──────────────────────────────────────────────────────────────

function openDB() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open('skateDB', 1);
		req.onupgradeneeded = (e) => {
			e.target.result.createObjectStore('userSelections', { keyPath: 'id' });
		};
		req.onsuccess = (e) => resolve(e.target.result);
		req.onerror = (e) => reject(e.target.error);
	});
}

export async function loadCustomSelections() {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction('userSelections', 'readonly');
		const req = tx.objectStore('userSelections').get('main');
		req.onsuccess = (e) => resolve(e.target.result ?? null);
		req.onerror = (e) => reject(e.target.error);
	});
}

export async function saveCustomSelections(data) {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction('userSelections', 'readwrite');
		const req = tx.objectStore('userSelections').put({ id: 'main', ...data });
		req.onsuccess = () => resolve();
		req.onerror = (e) => reject(e.target.error);
	});
}

export async function clearCustomSelections() {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction('userSelections', 'readwrite');
		const req = tx.objectStore('userSelections').delete('main');
		req.onsuccess = () => resolve();
		req.onerror = (e) => reject(e.target.error);
	});
}
