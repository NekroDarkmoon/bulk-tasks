import JSZip from 'jszip';
import { inferDocumentType } from '../utils/inferDocumentType.ts';
import { replaceAsync } from '../utils/replaceAsync.ts';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
class BulkTasksManager {
	static DEFAULT_NAMING_CONVENTION = '{name} {index}';

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

	static async duplicateDocuments(ids: Set<string>, options: DuplicateOptions) {
		if (ids.size === 0) return;

		// Prepare string args
		const namingConvention = options.namingConvention || this.DEFAULT_NAMING_CONVENTION;
		const now = new Date(Date.now()).toString();
		// @ts-expect-error
		await TextEditor._primeCompendiums([{ textContent: namingConvention }]);

		// Prepare data
		const duplicateData: Record<string, any> = {};
		for await (const uuid of ids) {
			if (!uuid) continue;

			const { id, ...parts } = foundry.utils.parseUuid(uuid);
			const type = parts.type as unknown as string;
			if (!type) continue;

			const cls = CONFIG[type].documentClass;
			const doc = cls.get(id)?.toObject();
			if (!doc) continue;

			// Apply Changes
			if (options.duplicateToRoot) doc.folder = null;
			if (options.resetImages && cls.DEFAULT_ICON) doc.img = cls.DEFAULT_ICON;

			// Adjust for num copies
			const docs = Array.from({ length: options.numCopies ?? 1 }, () => {
				return foundry.utils.deepClone(doc);
			});

			// Apply naming changes
			await Promise.all(
				docs.map(async (d, idx) => {
					d.name = await this.#enrichString(namingConvention, {
						originalName: d.name,
						idx,
						time: now,
					});
				}),
			);

			// Collect
			duplicateData[type] ??= [];
			duplicateData[type].push(...docs);
		}

		for await (const [type, docs] of Object.entries(duplicateData)) {
			const cls = CONFIG[type].documentClass;
			const chunkSize = 100;
			const chunks: any[] = [];
			for (let i = 0; i < Math.ceil(docs.length / chunkSize); i++) {
				chunks[i] = docs.slice(i * chunkSize, (i + 1) * chunkSize);
			}

			for await (const chunk of chunks) {
				await cls.createDocuments(chunk);
			}
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

	static async importDocuments(documents: any[]) {
		if (!documents.length) return;

		// Prepare data
		const importData: Record<string, any[]> = documents.reduce((acc, data) => {
			const type = inferDocumentType(data);
			console.log(type);
			if (!type) return;

			acc[type] ??= [];
			acc[type].push(data);
			return acc;
		}, {});

		for await (const [type, docs] of Object.entries(importData)) {
			const cls = CONFIG[type].documentClass;
			const chunkSize = 100;
			const chunks: any[] = [];
			for (let i = 0; i < Math.ceil(docs.length / chunkSize); i++) {
				chunks[i] = docs.slice(i * chunkSize, (i + 1) * chunkSize);
			}

			for await (const chunk of chunks) {
				await cls.createDocuments(chunk);
			}
		}
	}

	static async moveDocuments(ids: Set<string>, folderId: string) {
		if (!ids.size) return;

		// Prepare data
		let docType = '';
		const docs: any[] = [];
		const folders: any[] = [];
		const folderIds = new Set<string>();

		// Populate folderIds and docs
		ids.forEach((uuid) => {
			if (!uuid) return;

			const { id, ...parts } = foundry.utils.parseUuid(uuid);
			const type = parts.type as unknown as string;
			if (!type) return;

			if (type === 'Folder') {
				folderIds.add(id);
				folders.push(game.folders.get(id));
				return;
			}

			docType = type; // Set main doc type
			const doc = CONFIG[type].documentClass.get(id);
			if (!doc) return;

			docs.push(doc);
		});

		// Prepare updates for items
		const docUpdates = docs.reduce((acc, doc) => {
			const parentFolder = doc.folder;
			if (!parentFolder) {
				acc.push({ _id: doc.id ?? doc._id, folder: folderId });
				return acc;
			}

			if (folderIds.has(parentFolder.id)) return acc;
			if (parentFolder.ancestors.some((f) => folderIds.has(f.id))) return acc;

			acc.push({ _id: doc.id ?? doc._id, folder: folderId });
			return acc;
		}, [] as any[]);

		// Prepare updates for folders
		const folderUpdates = folders.reduce((acc, doc) => {
			const parentFolder = doc.folder;
			if (!parentFolder) {
				acc.push({ _id: doc.id ?? doc._id, folder: folderId });
				return acc;
			}

			if (folderIds.has(parentFolder.id)) return acc;
			if (parentFolder.ancestors.some((f) => folderIds.has(f.id))) return acc;

			acc.push({ _id: doc.id ?? doc._id, folder: folderId });
			return acc;
		}, [] as any[]);

		await Folder.updateDocuments(folderUpdates);
		await CONFIG[docType]?.documentClass.updateDocuments(docUpdates);
	}

	static async renameDocuments(ids: Set<string>, options: RenameOptions) {
		if (ids.size === 0) return;

		// Prepare string args
		const namingConvention = options.namingConvention || this.DEFAULT_NAMING_CONVENTION;
		const now = new Date(Date.now()).toString();
		// @ts-expect-error
		await TextEditor._primeCompendiums([{ textContent: namingConvention }]);

		// Prepare data
		const renameData: Record<string, any> = {};
		for await (const uuid of ids) {
			if (!uuid) continue;

			const { id, ...parts } = foundry.utils.parseUuid(uuid);
			const type = parts.type as unknown as string;
			if (!type) continue;

			const cls = CONFIG[type].documentClass;
			const doc = cls?.get(id)?.toObject();
			if (!doc) continue;

			const update = {
				_id: id,
				name: await this.#enrichString(namingConvention, {
					originalName: doc.name,
					time: now,
				}),
			};

			renameData[type] ??= [];
			renameData[type].push(update);
		}

		for await (const [type, updates] of Object.entries(renameData)) {
			const cls = CONFIG[type].documentClass;
			const chunkSize = 100;
			const chunks: any[] = [];
			for (let i = 0; i < Math.ceil(updates.length / chunkSize); i++) {
				chunks[i] = updates.slice(i * chunkSize, (i + 1) * chunkSize);
			}

			for await (const chunk of chunks) {
				await cls.updateDocuments(chunk);
			}
		}
	}

	static #cleanName(name: string): string {
		return name.slugify({ strict: true, replacement: '-' });
	}

	static async #enrichString(str: string, options: EnrichOptions): Promise<string> {
		let namingConvention = str || this.DEFAULT_NAMING_CONVENTION;

		namingConvention = namingConvention
			.replaceAll('{name}', options.originalName || '')
			.replaceAll('{index}', `${options.idx !== undefined ? options.idx + 1 : ''}`)
			.replace('{time}', options.time || '');

		// @ts-expect-error
		const documentTypes = CONST.DOCUMENT_LINK_TYPES.concat(['Compendium', 'UUID']);
		const rgx = new RegExp(
			`@(${documentTypes.join('|')})\\[([^#\\]]+)(?:#([^\\]]+))?](?:{([^}]+)})?`,
			'g',
		);

		const enrichedString = await replaceAsync(namingConvention, rgx, async (match) => {
			const uuid = match.at(2) || '';
			if (!uuid) return '';

			const { type } = foundry.utils.parseUuid(uuid);
			if (!type || type !== 'RollTable') return '';

			// @ts-expect-error
			const t = fromUuidSync(uuid);
			const result = (await t.roll())?.results?.at(0);
			return result?.text || '';
		});

		return enrichedString.replace(/\s+/g, ' ').trim();
	}

	static get namingConventionHint(): string {
		return `
      <div class="bm-naming-convention__hint">
        <span>Attributes</span>

        <ul>
          <li>{name} : Document Name</li>
          <li>{index} : Incrementing number of copies made</li>
          <li>{time} : Current Timestamp</li>
          <li>@UUID[uuid]: Get value from roll table.</li>
        </ul>
      </div>
    `;
	}
}

export interface DuplicateOptions {
	namingConvention: string;
	numCopies: number;
	duplicateToRoot: boolean;
	resetImages: boolean;
}

export interface RenameOptions {
	namingConvention: string;
}

export interface EnrichOptions {
	originalName: string;
	idx?: number;
	time: string;
}

export { BulkTasksManager };
