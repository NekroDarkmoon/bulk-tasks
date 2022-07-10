// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from './constants.js';

import { collapseFolder } from './partials/collapseFolder.js';
import { DataSelector } from './partials/DataSelector.js';
import { onDelete } from './partials/delete.js';
import { MoveMenu } from './partials/move.js';
import { permsFilter } from './partials/permsFilter.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                   Bulk Menu
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export class BulkMenu extends Application {
	constructor(dialogData = {}, options = {}) {
		super(dialogData, options);
		this.data = dialogData;

		this.directory = null;

		// Instantiate listeners
		Hooks.on('renderSidebarTab', this._refreshContent.bind(this));
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
					contentSelector: '.bm__data',
				},
			],
		});
	}

	getData(options = {}) {
		// Get Directories
		const docTypes = {
			actors: game.actors.directory,
			cards: game.cards.directory,
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
				const temp = permsFilter(folder.content);

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
			const noParent = permsFilter(
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

		// Data Selection
		const data = new DataSelector($parent);

		// On delete
		$parent.on('click', '#bm-delete', async event => {
			await onDelete.call(this, data.choices);
		});

		// On move
		$parent.on('click', '#bm-move', async event => {
			new MoveMenu({}, {}, data.choices).render(true);
			this.close();
		});

		// On cancel
		$parent.on('click', '#bm-cancel', event => {
			this.close();
		});

		// Collapsable folders
		$parent.on('click', '.bm__btn--collapsable', $btn => {
			collapseFolder($btn);
		});
	}

	/**
	 * @param {*} event
	 * @param {*} query
	 * @param {*} rgx
	 * @param {*} $parent
	 */
	_onSearchFilter(event, query, rgx, $parent) {
		// Expand all folders on query
		for (const $f of $parent.querySelectorAll('.bm__content:not(.bm--show)')) {
			if (query) $f.style.display = 'block';
			else $f.style.display = 'none';
		}

		// Hide elements
		for (const $entity of $parent.querySelectorAll('.bm__entity')) {
			if (!query) {
				$entity.classList.remove('bm--hidden');
				continue;
			}

			const title = $entity.querySelector(`.bm__check`).dataset.name;
			const match = rgx.test(SearchFilter.cleanQuery(title));
			$entity.classList.toggle('bm--hidden', !match);
		}

		// Hide folders with no children
		for (const $entity of $parent.querySelectorAll('.bm__li')) {
			if (!query) {
				$entity.classList.remove('bm--hidden');
				continue;
			}

			const $content = $($entity.querySelector('.bm__content'));
			const match = $content.children(':visible').length === 0;
			$entity.classList.toggle('bm--hidden', match);
		}
	}

	_refreshContent() {
		this.render(true);
	}
}
