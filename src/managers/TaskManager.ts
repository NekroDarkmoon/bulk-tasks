import JSZip from 'jszip';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
class BulkTasksManager {
	static async deleteDocuments(ids: Set<string>) {
		if (ids.size === 0) return;

		const deleteData = ids.reduce((acc, uuid) => {
			if (!uuid) return acc;

			const { id, ...parts } = foundry.utils.parseUuid(uuid);
			const type = parts.type as unknown as string;

			acc[type] ??= [];
			acc[type].push(id);
			return acc;
		}, {});

		for await (const [type, ids] of Object.entries(deleteData ?? {})) {
			await CONFIG[type].documentClass.deleteDocuments(ids);
		}
	}

	static async exportDocuments(ids: Set<string>) {
		if (ids.size === 0) return;

		const zip = new JSZip();
		const exportDocs: any[] = [];
		const folders = {};

		// Prepare data
		ids.forEach((uuid) => {
			if (!uuid) return;

			const { id, ...parts } = foundry.utils.parseUuid(uuid);
			const type = parts.type as unknown as string;
			if (type === 'Folder') return;

			const doc = CONFIG[type].documentClass.get(id);
			if (!doc) return;

			exportDocs.push(doc);

			let folder: string = doc.folder?.id;
			if (!folder) folder = 'root';

			folders[folder] ??= [];
			folders[folder].push(doc);
		});

		const cleanDoc = (doc) => {
			const data = doc.toCompendium(null);
			data.flags.exportSource = {
				// @ts-expect-error
				world: game.world.id,
				system: game.system.id,
				coreVersion: game.version,
				systemVersion: game.system.version,
			};

			return data;
		};

		// Create zip data
		const folderKeys = Object.keys(folders);
		if (folderKeys.length > 1) {
			folderKeys.forEach((folder) => {
				let folderZip = zip;
				if (folder !== 'root') {
					const name = game.folders.get(folder)?.name;
					if (name) folderZip = zip.folder(this.#cleanName(name))!;
				}

				const docs = folders[folder];
				docs.forEach((doc) => {
					folderZip.file(
						`${this.#cleanName(doc.name)}.json`,
						JSON.stringify(cleanDoc(doc), null, '\t'),
					);
				});
			});
		} else {
			Object.values(exportDocs).forEach((doc) => {
				zip.file(`${this.#cleanName(doc.name)}.json`, JSON.stringify(cleanDoc(doc), null, '\t'));
			});
		}

		// Download zip
		console.log('Generating Zip');
		zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }).then((blob) => {
			const a = document.createElement('a');
			a.href = window.URL.createObjectURL(blob);
			a.download = 'bulk-tasks-export.zip';

			// Dispatch a click event to the element
			a.dispatchEvent(
				new MouseEvent('click', {
					bubbles: true,
					cancelable: true,
					view: window,
				}),
			);
			setTimeout(() => window.URL.revokeObjectURL(a.href), 100);
		});
	}

	static #cleanName(name: string): string {
		return name.slugify({ strict: true, replacement: '-' });
	}
}

export { BulkTasksManager };
