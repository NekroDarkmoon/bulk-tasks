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

	activateListeners($parent) {
		super.activateListeners($parent);
	}

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
	}

	// activateListeners($parent) {
	// 	super.activateListeners($parent);
	// 	const directory = this.directory;
	// 	const $section = $parent.find(`section[data-tab="actors"]`);
	// 	const $searchWrapper = $section.find(`.bm-search-wrapper`);
	// 	const $input = $searchWrapper.find(`input[type="text"]`);
	// 	const $fieldset = $section.find(`.bulk-display`);
	// 	const $resultBox = $section.find(`.bm-search-result-box`);
	// 	let displayArray;

	// 	// Hide resultBox
	// 	$resultBox.hide();

	// 	// Create a filter list
	// 	$input.on('keyup', e => {
	// 		const userInput = e.target.value.toLowerCase();

	// 		if (userInput) {
	// 			const searchAbleArray = [...directory.actors.orphans];
	// 			displayArray = searchAbleArray.filter(val =>
	// 				val.name.includes(userInput)
	// 			);

	// 			$resultBox.text(displayArray);
	// 			$searchWrapper.addClass('active').trigger('classChange');
	// 		} else $searchWrapper.removeClass('active').trigger('classChange');
	// 	});

	// 	// Change content based on search
	// 	$searchWrapper.on('classChange', e => {
	// 		if ($searchWrapper.hasClass('active')) {
	// 			$fieldset.hide();
	// 			$resultBox.show();
	// 		} else {
	// 			$resultBox.hide();
	// 			$fieldset.show();
	// 		}
	// 	});
	// }

	/**
	 * @param {Array<Object>} inputArray
	 * @returns {Array<Object>}
	 */
	permsFilter(inputArray) {
		return inputArray.filter(
			e => e.data.permission.default == 3 || e.data.permission[this.userID] == 3
		);
	}
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
