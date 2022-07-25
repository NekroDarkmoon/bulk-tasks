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
async function deleteDocuments(data) {
	const [docs, folders, ..._] = data;
	// Display notif
	ui.notifications.info(`Deleting ${docs.size} documents. Please be patient.`);

	const dFolders = new Set();

	// FIXME: Make better
	const massDelete = {};

	// Delete Items
	for (const doc of docs) {
		if (!massDelete[doc.type]) {
			massDelete[doc.type] = [];
		}

		const d = game[doc.type].get(doc.id);
		if (d?.folder?.id) dFolders.add(d.folder.id);
		massDelete[doc.type].push(doc.id);
	}

	for (const [doc, ids] of Object.entries(massDelete)) {
		await game[doc].documentClass.deleteDocuments(ids);
	}

	// Cascade delete empty folders
	for (const folder of game.folders) {
		if (!dFolders.has(folder.id)) continue;
		await deleteFolder(folder);
	}

	for (const folder of folders) await deleteFolder(game.folders.get(folder.id));

	ui.notifications.info(`Deleted ${docs.size} documents.`);

	this.render(true);
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                         Delete Folders
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
async function deleteFolder(folder) {
	if (!folder) return;
	const parent = folder.folder;
	if (folder.content.length == 0) await folder.delete();

	if (parent) await deleteFolder(parent);
}
