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
		const data = {};
		return data;
	}

	activateListeners(html) {
		super.activateListeners(html);
	}
}
