// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from '../constants.js';

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
