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
		this.userID = game.user.id;
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: 'Bulk Tasks',
			id: 'bulk-tasks-meneu',
			template: `modules/${moduleName}/templates/bulkMenu.html`,
			width: 580,
			height: 'auto',
			resizeable: true,
			closeOnSubmit: false,
			tabs: [
				{ navSelector: '.tabs', contentSelector: 'form', intial: 'actors' },
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
		return data;
	}

	activateListeners(html) {
		super.activateListeners(html);
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
}
