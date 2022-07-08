// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from './constants.js';
import { DataSelector } from './partials/DataSelector.js';

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

		// Data Selection
		const data = new DataSelector($parent);

		// On delete
		$parent.on('click', '#bm-delete', async event => {
			Dialog.confirm({
				title: 'Delete Selected',
				content:
					'Are you sure? </br> This action is permanent and cannot be undone.',
				yes: () => {
					this.deleteObjs(data.choices);
				},
				no: () => {
					this.close();
				},
				defaultValue: false,
			});
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
		$parent.on('click', '.bm__btn--collapsable', btn => {
			const $content =
				btn.currentTarget.parentElement.parentElement.nextElementSibling;

			if ($content.style.display === 'block') $content.style.display = 'none';
			else $content.style.display = 'block';
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
		for (let item of choices) {
			await game[item.type].get(item.id).delete();
			console.log(`${moduleTag} | Deleted ${item.name}`);
		}

		this.render(true);
	}
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Move Menu
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export class MoveMenu extends Application {
	/**
	 *
	 * @param {*} dialogData
	 * @param {*} options
	 * @param {Set} selected
	 */
	constructor(dialogData = {}, options = {}, selected = {}) {
		super(dialogData, options);

		this.data = dialogData;
		this.choices = selected;
		this.docTypes = null;
		this.mostType = null;

		// Get list of folders and types.
		this.folders = game.folders._source;
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

	getData(options = {}) {
		// Define base structs
		const docTypes = {
			actors: [],
			cards: [],
			journal: [],
			items: [],
			scenes: [],
			tables: [],
			playlists: [],
			macros: [],
		};

		const defFolderTypes = {
			Actor: [],
			JournalEntry: [],
			Cards: [],
			Item: [],
			Scene: [],
			RollTable: [],
			Playlist: [],
			Macro: [],
		};

		// Add to types
		this.choices.forEach(c => docTypes[c.type].push(c));
		this.docTypes = docTypes;

		this.folders.forEach(f => defFolderTypes[f.type].push(f));

		this.mostType = Object.keys(docTypes).reduce((a, b) =>
			docTypes[a].length > docTypes[b].length ? a : b
		);

		// Define folders
		const DFMapping = {
			actors: defFolderTypes.Actor,
			cards: defFolderTypes.Cards,
			journal: defFolderTypes.JournalEntry,
			items: defFolderTypes.Item,
			scenes: defFolderTypes.Scene,
			tables: defFolderTypes.RollTable,
			playlists: defFolderTypes.Playlist,
			macros: defFolderTypes.Macro,
		};

		return {
			choices: docTypes[this.mostType],
			folders: DFMapping[this.mostType],
		};
	}

	activateListeners($parent) {
		super.activateListeners($parent);

		$parent.on('click', '#bmove-move', async e => {
			const destFolder = $('.bm-destination-select').find(':selected')[0]
				.dataset;

			for (let item of this.docTypes[this.mostType]) {
				await game[item.type].get(item.id).update({ folder: destFolder.id });
				console.log(`${moduleTag} | Moving ${item.name} to ${destFolder.name}`);
			}

			this.close();
		});

		$parent.on('click', '#bmove-cancel', e => {
			this.close();
		});
	}
}
