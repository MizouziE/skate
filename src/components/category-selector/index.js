export function initCategorySelector(state, listMap) {
	document
		.querySelectorAll('#listSelector input[type="checkbox"]')
		.forEach((input) => {
			input.addEventListener('change', () => {
				if (!listMap[input.name]) return; // variations-toggle — no rebuild needed
				state.excluded.clear();
				state.lastLanded = null;
				state.rebuildSectors();
				if (state.tot) state.drawWheel();
				state.rotate();
			});
		});
}
