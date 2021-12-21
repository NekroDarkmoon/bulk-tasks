// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from './constants.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                   Bulk Menu
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export class BulkMenu extends Application {
	constructor(dialogData = {}, options = {}) {
		super(dialogData, options);
		this.data = dialogData;

		this.directory = null;
		this.userID = game.user.id;
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: 'Bulk Tasks',
			id: 'bulk-tasks-meneu',
			template: `modules/${moduleName}/templates/bulkMenu.hbs`,
			width: 580,
			height: 'auto',
			resizeable: true,
			closeOnSubmit: false,
			tabs: [
				{ navSelector: '.tabs', contentSelector: 'form', intial: 'actors' },
			],
			filters: [
				{
					inputSelector: 'input[name="search"]',
					contentSelector: '.bm-data',
				},
			],
		});
	}

	getData(options = {}) {
		// Get Directories
		const docTypes = {
			actors: game.actors.directory,
			journal: game.journal.directory,
			items: game.items.directory,
			macros: game.macros.directory,
			scenes: game.scenes.directory,
			tables: game.tables.directory,
			playlists: game.playlists.directory,
		};

		// Construct self folder lists
		const directory = {};

		for (const docType in docTypes) {
			const folders = docTypes[docType].folders;

			// Add to directory
			directory[docType] = { folders: [], orphans: [] };

			folders.forEach(folder => {
				const temp = this.permsFilter(folder.content);

				// Create our own object
				const customFolder = {
					id: folder.data._id,
					name: folder.data.name,
					content: temp,
					type: folder.data.type,
				};
				directory[docType].folders.push(customFolder);
			});

			// Add content not in folder
			const entities = docTypes[docType].documents;
			const noParent = this.permsFilter(
				entities.filter(e => e.data.folder === null)
			);

			directory[docType].orphans = [...noParent];
		}

		const data = directory;
		console.info(directory);

		this.directory = directory;
		return data;
	}

	/**
	 * @param {*} $parent
	 */
	activateListeners($parent) {
		super.activateListeners($parent);

		// Global params
		const choices = new Set();
		let lastChecked = null;

		// On check entity
		$parent.find(`.bm-check`).on('change', $event => {
			const entity = $event.currentTarget.dataset;
			const isChecked = $event.currentTarget.checked;

			if (isChecked) choices.add(entity);
			else choices.delete(entity);
		});

		// On check folder
		$parent.find(`.bm-check-folder`).on('change', $event => {
			const $content =
				$event.currentTarget.parentElement.nextElementSibling.children;
			console.log($content);

			for (const $c of $content) {
				const $entity = $c.querySelector('.bm-check');
				const isChecked = $event.currentTarget.checked ? true : false;
				const data = $entity.dataset;

				$($entity).prop('checked', isChecked);
				if (isChecked) choices.add(data);
				else choices.delete(data);
			}
		});

		// On Shift Select
		$parent.find('.bm-check').on('click', e => {
			console.log(lastChecked);
			if (!lastChecked) {
				lastChecked = e.currentTarget;
				return;
			}

			// Get all checkboxes in scope
			const $section = e.currentTarget.closest('.tab');
			const checks = [
				...$section.querySelectorAll(':not(.bm-hidden) >.bm-check'),
			];

			if (e.shiftKey) {
				const startTemp = checks.indexOf(e.currentTarget);
				const endTemp = checks.indexOf(lastChecked);

				const start = Math.min(startTemp, endTemp);
				const end = Math.max(startTemp, endTemp);

				for (let i = start; i <= end; i++) {
					$(checks[i]).prop('checked', lastChecked.checked);
					const data = checks[i].dataset;
					if (lastChecked.checked) choices.add(data);
					else choices.delete(data);
				}
			}
			lastChecked = e.currentTarget;
		});

		// On Select All
		$parent.on('click', '.bm-selector-sa', $event => {
			const $section = $event.currentTarget.parentElement.parentElement;
			const $content = $section.querySelectorAll(`.bm-check`);
			const $folders = $section.querySelectorAll(`.bm-check-folder`);

			// Select each element
			for (const $c of $content) {
				const data = $c.dataset;
				$($c).prop('checked', true);
				choices.add(data);
			}

			for (const $folder of $folders) $($folder).prop('checked', true);
		});

		// On DeSelect All
		$parent.on('click', '.bm-selector-dsa', $event => {
			const $section = $event.currentTarget.parentElement.parentElement;
			const $content = $section.querySelectorAll(`.bm-check`);
			const $folders = $section.querySelectorAll(`.bm-check-folder`);

			// Select each element
			for (const $c of $content) {
				const data = $c.dataset;
				$($c).prop('checked', false);
				choices.delete(data);
			}

			for (const $folder of $folders) $($folder).prop('checked', false);
		});

		// On delete
		$parent.on('click', '#bm-delete', async event => {
			Dialog.confirm({
				title: 'Delete Selected',
				content:
					'Are you sure? </br> This action is permanent and cannot be undone.',
				yes: () => {
					this.deleteObjs(choices);
				},
				no: () => {
					this.close();
				},
				defaultValue: false,
			});
		});

		// On move
		$parent.on('click', '#bm-move', async event => {
			const moveMenu = new MoveMenu({}, {}, choices).render(true);
			this.close();
		});

		// On cancel
		$parent.on('click', '#bm-cancel', event => {
			this.close();
		});
	}

	/**
	 * @param {*} event
	 * @param {*} query
	 * @param {*} rgx
	 * @param {*} $parent
	 */
	_onSearchFilter(event, query, rgx, $parent) {
		for (const $entity of $parent.querySelectorAll('.bm-entity')) {
			if (!query) {
				$entity.classList.remove('bm-hidden');
				continue;
			}

			const title = $entity.querySelector(`.bm-check`).dataset.name;
			const match = rgx.test(SearchFilter.cleanQuery(title));
			$entity.classList.toggle('bm-hidden', !match);
		}

		// Hide folders with no children
		for (const $entity of $parent.querySelectorAll('.bm-li')) {
			if (!query) {
				$entity.classList.remove('bm-hidden');
				continue;
			}

			const $content = $($entity.querySelector('.bm-content'));

			const match = $content.children(':visible').length === 0;
			$entity.classList.toggle('bm-hidden', match);
		}
	}

	/**
	 * @param {Array<Object>} inputArray
	 * @returns {Array<Object>}
	 */
	permsFilter(inputArray) {
		return inputArray.filter(
			e => e.data.permission.default == 3 || e.data.permission[this.userID] == 3
		);
	}

	async deleteObjs(choices) {
		console.log(choices);

		for (let item of choices) {
			console.log(game[item.type].get(item.id));
		}
	}
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Move Menu
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
