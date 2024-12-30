function createNode(node) {
	return {
		// Folders
		children: node.children.map((c) => createNode(c)),
		depth: node.depth,
		// Documents
		entries: node.entries.map((e) => ({
			name: e.name,
			uuid: e.uuid,
			type: e.collectionName,
			visible: e.visible,
		})),
		name: node.folder?.name || 'root',
		uuid: node.folder?.uuid || undefined,
		collapsed: true,
		root: node.root,
		visible: node.visible,
	};
}

export function buildDirectory(id: string) {
	// @ts-ignore
	const tree = game[id]?.tree ?? {};

	// const _recurse = (root) => {
	// 	if (!root.children?.length) {
	// 		return {
	// 			name: root.folder?.name || 'root',
	// 			uuid: root.folder?.uuid || undefined,
	// 			documents: root.entries.map((d) => ({
	// 				name: d.name,
	// 				uuid: d.uuid,
	// 				type: d.collectionName,
	// 			})),
	// 		};
	// 	}

	// 	const folders = root.children.map((f) => _recurse(f));
	// 	const documents = root.entries.map((d) => ({
	// 		name: d.name,
	// 		uuid: d.uuid,
	// 		type: d.collectionName,
	// 	}));

	// 	return {
	// 		name: root.folder?.name || 'root',
	// 		uuid: root.folder?.uuid || undefined,
	// 		folders,
	// 		documents,
	// 	};
	// };

	return createNode(tree);
	// return _recurse(tree);
}
