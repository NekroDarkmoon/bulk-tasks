// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from '../constants.js';

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                         Confirmations
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export async function onDelete(choices) {
	Dialog.confirm({
		title: game.i18n.localize('BM.deleteTitle'),
		content: game.i18n.localize('BM.deleteContent'),
		yes: () => deleteDocuments.call(this, choices),
		no: () => this.close(),
		defaultValue: false,
	});
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                         Delete Documents
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
async function deleteDocuments(docs) {
	// Display notif
	const folders = new Set();

	// Delete Items
	for (const doc of docs) {
		const d = game[doc.type].get(doc.id);
		if (d?.folder?.id) folders.add(d.folder.id);

		await d.delete();
		console.info(`${moduleTag} | Deleted ${doc.name}`);
	}

	// Cascade delete empty folders
	for (const folder of game.folders) {
		if (!folders.has(folder.id)) continue;
		await deleteFolder(folder);
	}

	this.render(true);
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                         Delete Folders
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
async function deleteFolder(folder) {
	const parent = folder.folder;
	if (folder.content.length == 0) await folder.delete();

	if (parent) await deleteFolder(parent);
}
