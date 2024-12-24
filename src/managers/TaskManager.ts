class BulkTasksManager {
	static async deleteDocuments(ids: Set<string>) {
		const deleteData = ids.reduce((acc, uuid) => {
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
}

export { BulkTasksManager };
