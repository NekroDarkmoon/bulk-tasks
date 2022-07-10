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

	// Delete Items
	for (const doc of docs) {
		const d = game[doc.type].get(doc.id);
		if (d?.folder?.id) dFolders.add(d.folder.id);

		await d.delete();
		console.info(`${moduleTag} | Deleted ${doc.name}`);
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
