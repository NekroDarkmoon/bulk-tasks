// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from '../constants.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                  Single Select
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export class BulkImporter extends Application {
	constructor(dialogData = {}, options = {}, selected = {}) {
		super(dialogData, options);

		this.data = dialogData;
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: 'Bulk Import',
			id: 'bulk-tasks-import',
			template: `modules/${moduleName}/templates/bulkImport.hbs`,
			width: 500,
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
