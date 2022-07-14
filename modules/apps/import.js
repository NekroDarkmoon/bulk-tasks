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
		$parent.on('change', '#bm__import--files', event => {
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
		$parent.on('click', '#bm__import--queue', event => {
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
		// X Choices Button
		$parent.on('click', '.bm__import--remove-choices', event => {});

		// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// X Selected Button
		$parent.on('click', '.bm__import--remove-selected', event => {});

		// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// Remove All Button
		$parent.on('click', '#bm__import--reset', event => {
			for (const [type, files] of Object.entries(this.selected)) files.clear();
			this.render(true);
		});

		// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// Import Button
		$parent.on('click', '#bm__import--confirm', event => {
			console.log(event);
		});

		// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// TODO: Convert to back
		// On cancel
		$parent.on('click', '#bm--cancel', event => {
			this.close();
			new MainMenu().render(true);
		});
	}
}
