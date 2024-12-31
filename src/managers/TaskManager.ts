import JSZip from 'jszip';
import { inferDocumentType } from '../utils/inferDocumentType.ts';
import { replaceAsync } from '../utils/replaceAsync.ts';
import { moduleId } from '../constants.ts';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
class BulkTasksManager {
	static get DEFAULTS() {
		return {
			EXPORT_NAMING_CONVENTION:
				// @ts-expect-error
				(game.settings?.get(moduleId, 'defaultExportNamingConvention') as string) || '{foundry}',
			EXPORT_ZIP_NAME:
				// @ts-expect-error
				(game.settings?.get(moduleId, 'defaultExportZipName') as string) || 'bulk-tasks-export',
			DUPLICATE_NAMING_CONVENTION:
				// @ts-expect-error
				(game.settings?.get(moduleId, 'defaultDuplicateNamingConvention') as string) ||
				'{name} #{index}',
			RENAME_NAMING_CONVENTION:
				// @ts-expect-error
				(game.settings?.get(moduleId, 'defaultRenameNamingConvention') as string) || '{name}',
		};
	}

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
		const namingConvention = options.namingConvention || this.DEFAULTS.DUPLICATE_NAMING_CONVENTION;
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

	static async exportDocuments(ids: Set<string>, options: ExportOptions) {
		if (ids.size === 0) return;

		const namingConvention = options.namingConvention || this.DEFAULTS.EXPORT_NAMING_CONVENTION;
		const now = new Date(Date.now()).toString();

		const zip = new JSZip();
		const exportDocs: any[] = [];
		const fDocs = {};

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

			fDocs[folder] ??= [];
			fDocs[folder].push(doc);
		});

		const cleanDoc = (doc) => {
			const data = doc.toCompendium(null);
			if (options.preserveMetaData) {
				data.flags.exportSource = {
					// @ts-expect-error
					world: game.world.id,
					system: game.system.id,
					coreVersion: game.version,
					systemVersion: game.system.version,
				};
			}

			return data;
		};

		// Create zip data
		const folderKeys = Object.keys(fDocs);
		if (folderKeys.length > 1 && options.preserveFolders) {
			const folders = folderKeys.map((f) => game.folders.get(f));
			const dir: Record<string, { name: string; entries: any[]; folders: any[] }> = {};
			const handled = new Set<string>();

			// Assign folder locations
			folders.forEach((f) => {
				const id = f?.id ?? 'root';
				dir[id] = {
					name: f?.name || 'root',
					entries: fDocs[id],
					folders: (f?.children ?? []).map((e) => e.folder?.id).filter((e) => !!e),
				};
			});

			// Update to match folder locations
			Object.values(dir).forEach((node) => {
				node.folders = node.folders
					.map((f) => {
						handled.add(f);
						return dir[f];
					})
					.filter((f) => !!f);
			});

			// Remove subfolders from root
			[...handled].forEach((id) => delete dir[id]);

			// Recursing Function for zip node creation
			const createNode = (currNode, zip: JSZip) => {
				const folderZip = zip.folder(this.#cleanName(currNode.name))!;

				const docs = currNode.entries;
				docs.forEach((doc) => {
					folderZip.file(
						`${this.#cleanName(doc.name, { namingConvention, time: now, documentName: doc.documentName, documentId: doc.id || doc._id })}.json`,
						JSON.stringify(cleanDoc(doc), null, '\t'),
					);
				});

				currNode.folders.forEach((fn) => createNode(fn, folderZip));
			};

			Object.entries(dir).forEach(([id, node]) => {
				const currNode = node;
				const folderZip = zip;

				if (id === 'root') {
					const docs = dir.root.entries;
					docs.forEach((doc) => {
						folderZip.file(
							`${this.#cleanName(doc.name, { namingConvention, time: now, documentName: doc.documentName, documentId: doc.id || doc._id })}.json`,
							JSON.stringify(cleanDoc(doc), null, '\t'),
						);
					});
					return;
				}

				createNode(currNode, folderZip);
			});
		} else {
			Object.values(exportDocs).forEach((doc) => {
				zip.file(
					`${this.#cleanName(doc.name, { namingConvention, time: now, documentName: doc.documentName, documentId: doc.id || doc._id })}.json`,
					JSON.stringify(cleanDoc(doc), null, '\t'),
				);
			});
		}

		// Download zip
		console.log('Generating Zip');
		zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }).then((blob) => {
			const a = document.createElement('a');
			a.href = window.URL.createObjectURL(blob);
			a.download = options.zipName || this.DEFAULTS.EXPORT_ZIP_NAME;

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
		const namingConvention = options.namingConvention || this.DEFAULTS.RENAME_NAMING_CONVENTION;
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

	static #cleanName(name: string, options?: ExportFileNamingOptions): string {
		if (!options) return name.slugify({ strict: true, replacement: '-' });

		const namingConvention = options.namingConvention;
		if (namingConvention.toLowerCase().includes('{foundry}')) {
			const filename = [
				'fvtt',
				options.documentName,
				name?.slugify(),
				options.documentId,
			].filterJoin('-');
			return filename;
		}

		console.log(namingConvention);
		if (namingConvention.toLowerCase().includes('{bulk-tasks}')) {
			return name.slugify({ strict: true, replacement: '-' });
		}

		return namingConvention
			.replaceAll('{name}', name)
			.replaceAll('{time}', options.time)
			.replace(/\s+/g, ' ')
			.trim();
	}

	static async #enrichString(str: string, options: EnrichOptions): Promise<string> {
		let namingConvention = str;

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

	static get exportNamingConvention(): string {
		return `
      <div class="bm-naming-convention__hint">
        <span>Attributes</span>

        <ul>
          <li>{name} : Document Name</li>
          <li>{time} : Current Timestamp</li>
          <li>{foundry} : Foundry export naming scheme</li>
          <li>{bulk-tasks} : Bulk Tasks export naming scheme</li>
        </ul>
      </div>
    `;
	}
}

export interface ExportOptions {
	namingConvention: string;
	preserveFolders: boolean;
	preserveMetaData: boolean;
	zipName: string;
}

export interface ExportFileNamingOptions {
	namingConvention: string;
	time: string;
	documentName: string;
	documentId: string;
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
