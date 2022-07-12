// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from './constants.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                   Application
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

export class MainMenu extends Application {
	constructor(dialogData = {}, options = {}) {
		super(dialogData, options);
		this.data = dialogData;
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: 'Bulk Tasks',
			id: 'bulk-tasks-main-menu',
			classes: ['bulk-tasks-main'],
			template: `modules/${moduleName}/templates/mainMenu.hbs`,
			width: 'auto',
			height: 'auto',
			resizeable: true,
			closeOnSubmit: false,
		});
	}

	getData(options = {}) {
		return null;
	}

	activateListeners($parent) {
		super.activateListeners($parent);
	}
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
