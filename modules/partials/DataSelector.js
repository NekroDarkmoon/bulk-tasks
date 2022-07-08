// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from '../constants.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                  Single Select
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export class DataSelector {
	constructor($parent) {
		this.choices = new Set();
		this.lastChecked = null;

		// Initiate listeners
		$parent.find(`.bm__check`).on('change', this.singleSelect.bind(this));
		$parent
			.find(`.bm__check__folder`)
			.on('change', this.folderSelect.bind(this));
		$parent.find(`.bm__check`).on('click', this.shiftSelect.bind(this));
		$parent.on('click', `.bm-selector-sa`, this.selectAll.bind(this));
		$parent.on('click', `.bm-selector-dsa`, this.deselectAll.bind(this));
	}

	// =================================================================
	//                          Single Select
	singleSelect($event) {
		const entity = $event.currentTarget.dataset;
		const isChecked = $event.currentTarget.checked;

		if (isChecked) this.choices.add(entity);
		else this.choices.delete(entity);
	}

	// =================================================================
	//                          Folder Select
	folderSelect($event) {
		const $content =
			$event.currentTarget.parentElement.nextElementSibling.children;

		for (const $c of $content) {
			const $entity = $c.querySelector('.bm__check');
			const isChecked = $event.currentTarget.checked ? true : false;
			const data = $entity.dataset;

			$($entity).prop('checked', isChecked);

			if (isChecked) this.choices.add(data);
			else this.choices.delete(data);
		}
	}

	// =================================================================
	//                          Shift Select
	shiftSelect($event) {
		if (!this.lastChecked) {
			this.lastChecked = $event.currentTarget;
			return;
		}

		// Get all checkboxes in scope
		const $section = $event.currentTarget.closest('.tab');
		const checks = [
			...$section.querySelectorAll(':not(.bm--hidden) >.bm__check'),
		];

		if ($event.shiftKey) {
			const startTemp = checks.indexOf($event.currentTarget);
			const endTemp = checks.indexOf(this.lastChecked);

			const start = Math.min(startTemp, endTemp);
			const end = Math.max(startTemp, endTemp);

			for (let i = start; i <= end; i++) {
				$(checks[i]).prop('checked', this.lastChecked.checked);
				const data = checks[i].dataset;

				if (this.lastChecked.checked) this.choices.add(data);
				else this.choices.delete(data);
			}
		}

		this.lastChecked = $event.currentTarget;
	}

	// =================================================================
	//                          Select All
	selectAll($event) {
		const $section = $event.currentTarget.parentElement.parentElement;
		const $content = $section.querySelectorAll(`.bm__check`);
		const $folders = $section.querySelectorAll(`.bm__check__folder`);

		// Select each element
		for (const $c of $content) {
			const data = $c.dataset;
			$($c).prop('checked', true);
			this.choices.add(data);
		}

		for (const $folder of $folders) $($folder).prop('checked', true);
	}

	// =================================================================
	//                         De-Select All
	deselectAll($event) {
		const $section = $event.currentTarget.parentElement.parentElement;
		const $content = $section.querySelectorAll(`.bm__check`);
		const $folders = $section.querySelectorAll(`.bm__check__folder`);

		// Select each element
		for (const $c of $content) {
			const data = $c.dataset;
			$($c).prop('checked', false);
			this.choices.delete(data);
		}

		for (const $folder of $folders) $($folder).prop('checked', false);
	}
}
