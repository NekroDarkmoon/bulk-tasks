// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from '../constants.js';

import { collapseFolder } from '../partials/viewUtils.js';
import { DataSelector } from '../partials/DataSelector.js';
import { MainMenu } from '../mainMenu.js';
import { permsFilter } from '../partials/permsFilter.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    MoveApp
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export class MoveApp extends Application {
	constructor(dialogData = {}, options = {}) {
		super(dialogData, options);

		this.data = dialogData;
		this.directory = null;

		// Instantiate listeners
		this.hookID = Hooks.on('renderSidebarTab', this._refreshContent.bind(this));
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: 'Move Documents',
			id: 'bulk-tasks-move',
			template: `modules/${moduleName}/templates/bulkMove.hbs`,
			width: 750,
			height: 'auto',
			resizable: true,
			closeOnSubmit: false,
			tabs: [
				{ navSelector: '.tabs', contentSelector: 'form', initial: 'actors' },
			],
			filters: [
				{
					inputSelector: 'input[name="search"]',
					contentSelector:
						'.bm__directory-view-data, .bm__folder-directory-view-data',
				},
			],
		});
	}

	getData(options = {}) {
		const data = {};

		// Create Directory Data
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

		// +++++++++++++++++++++++++++++++++++++++++++
		// Construct self folder lists
		const directory = {};
		const foldersDir = {};

		for (const docType in docTypes) {
			const folders = docTypes[docType].folders;

			// Add to foldersDir
			foldersDir[docType] = folders
				.filter(f => f.permission === 3)
				.map(f => {
					return { id: f.id, name: f.name, type: f.type };
				});

			// Add to directory
			directory[docType] = { folders: [], orphans: [] };

			folders.forEach(folder => {
				const temp = permsFilter(folder.content);

				// Create our own object
				const customFolder = {
					id: folder.id,
					name: folder.name,
					content: temp,
					type: folder.type,
				};
				directory[docType].folders.push(customFolder);
			});

			// Add content not in folder
			const entities = docTypes[docType].documents;
			const noParent = permsFilter(
				entities.filter(e => e.data.folder === null)
			);

			directory[docType].orphans = [...noParent];
			foldersDir[docType].push({
				id: 'root',
				name: 'root',
				type: game[docTypes[docType].tabName].documentName,
			});
		}

		data.directory = directory;
		this.directory = directory;
		data.foldersDir = foldersDir;

		return data;
	}

	/**
	 * @param {*} $parent
	 */
	activateListeners($parent) {
		super.activateListeners($parent);

		// Data Selection
		const data = new DataSelector($parent);

		// TODO: Remove
		// On move
		$parent.on('click', '#bm__btn--move', async event => {
			console.log(event);
			console.log(data);
		});

		// TODO: Convert to back
		// On cancel
		$parent.on('click', '#bm__btn--cancel', event => {
			this.close();
			new MainMenu().render(true);
		});

		// Collapsible folders
		$parent.on('click', '.bm__btn--collapsible', $btn => {
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
		for (const $f of $parent.querySelectorAll(
			'.bm__directory__folder-content:not(.bm--show)'
		)) {
			if (query) $f.style.display = 'block';
			else $f.style.display = 'none';
		}

		// Hide elements
		for (const $entity of $parent.querySelectorAll('.bm__directory__entity')) {
			if (!query) {
				$entity.classList.remove('bm--hidden');
				continue;
			}

			const title = $entity.querySelector(`.bm__directory__check`).dataset.name;
			const match = rgx.test(SearchFilter.cleanQuery(title));
			$entity.classList.toggle('bm--hidden', !match);
		}

		// Hide folders with no children
		for (const $entity of $parent.querySelectorAll('.bm__li')) {
			if (!query) {
				$entity.classList.remove('bm--hidden');
				continue;
			}

			const $content = $(
				$entity.querySelector('.bm__directory__folder-content')
			);
			const match = $content.children(':visible').length === 0;
			$entity.classList.toggle('bm--hidden', match);
		}
	}

	_refreshContent() {
		this.render(true);
	}

	async close() {
		Hooks.off('renderSidebarTab', this.hookID);
		super.close();
	}
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    MoveApp
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class Move extends Application {
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
			title: 'Move Documents',
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

			ui.notifications.info(
				`Moving ${
					this.docTypes[this.mostType].length
				} documents. Please be patient.`
			);

			for (let item of this.docTypes[this.mostType]) {
				await game[item.type].get(item.id).update({ folder: destFolder.id });
				console.log(`${moduleTag} | Moving ${item.name} to ${destFolder.name}`);
			}

			ui.notifications.info(
				`Moved ${this.docTypes[this.mostType].length} documents.`
			);

			this.close();
		});

		$parent.on('click', '#bmove-cancel', e => {
			this.close();
		});
	}
}
