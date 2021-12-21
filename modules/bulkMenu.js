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
			journals: game.journal.directory,
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

		const choices = new Set();

		// On check entity
		$parent.find(`.bm-check`).on('change', event => {
			const entity = event.currentTarget.dataset;
			const isChecked = event.currentTarget.checked;

			if (isChecked) choices.add(entity);
			else choices.delete(entity);
		});

		// TODO: On check folder

		// TODO: On Select All

		// TODO: On DeSelect All

		// On delete
		$parent.on('click', '#bm-delete', async event => {
			console.log(choices);
			Dialog.confirm({
				title: 'Delete Selected',
				content:
					'Are you sure? </br> This action is permanent and cannot be undone.',
				yes: () => {
					this.deleteObjs(choices);
				},
				no: () => {
					this.cloe();
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
		// TODO: Hide folders with no children

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

	async deleteObjs(choices) {}
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Move Menu
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export class MoveMenu extends Application {
	constructor(dialogData = {}, options = {}, selected = {}) {
		super(dialogData, options);

		this.data = dialogData;
		this.choices = selected;
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: 'Move Entities',
			id: 'bulk-tasks-move',
			template: `modules/${moduleName}/templates/bulkMove.html`,
			width: 500,
			height: 'auto',
			resizable: true,
			closeOnSubmit: false,
		});
	}
}
