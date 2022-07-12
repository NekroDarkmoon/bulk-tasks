// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from '../constants.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                  Single Select
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export class ImportApp extends Application {
	constructor(dialogData = {}, options = {}, selected = {}) {
		super(dialogData, options);

		this.data = dialogData;
		this.selected = new Set();
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: 'Bulk Import',
			id: 'bulk-tasks-import',
			template: `modules/${moduleName}/templates/bulkImport.hbs`,
			width: 500,
			height: 'auto',
			resizable: true,
			closeOnSubmit: false,
		});
	}

	getData(options = {}) {
		const data = {};

		const documentTypes = {
			actors: 'Actor',
			cards: 'Cards',
			journal: 'JournalEntry',
			items: 'Item',
			scenes: 'Scene',
			tables: 'RollTable',
			playlists: 'Playlist',
			macros: 'Macro',
		};

		data.documentTypes;

		return data;
	}

	activateListeners($parent) {
		super.activateListeners($parent);

		const choices = new Set();
	}
}
