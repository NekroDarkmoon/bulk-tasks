// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from '../constants.js';
import { MainMenu } from '../mainMenu.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                  Single Select
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export class ImportApp extends Application {
	constructor(dialogData = {}, options = {}, selected = {}) {
		super(dialogData, options);

		this.data = dialogData;

		this.chosen = new Set();
		this.selected = CONST.DOCUMENT_LINK_TYPES.reduce(
			(o, key) => Object.assign(o, { [key]: new Set() }),
			{}
		);

		console.log(this.selected);
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

		data.documentTypes = CONST.DOCUMENT_LINK_TYPES;
		data.chosen = [...this.chosen];

		// Filter Selected
		data.selected = this.selected;

		return data;
	}

	activateListeners($parent) {
		super.activateListeners($parent);

		// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// Showcase selected files.
		$('#bm__import-files').change(event => {
			const files = [...event.currentTarget.files].filter(
				file => file.type === 'application/json'
			);

			// Add files to chosen.
			files.forEach(f => this.chosen.add(f));
			console.log(this.chosen);

			this.render(true);
		});

		// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// Queue Button
		$parent.on('click', '#bm__import-queue', event => {
			const selectMenu = event.currentTarget.previousElementSibling;
			const type = selectMenu.options[selectMenu.selectedIndex].value;

			this.chosen.forEach(f => {
				this.selected[type].add(f);
				this.chosen.delete(f);
			});

			// console.log(this.selected);
			this.render(true);
		});

		// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// TODO: Convert to back
		// On cancel
		$parent.on('click', '#bm-cancel', event => {
			this.close();
			new MainMenu().render(true);
		});
	}
}
