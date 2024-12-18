export function buildDirectory(id: string) {
  // @ts-ignore
  let tree = game[id]?.tree ?? {};

  const _recurse = (root) => {
    if (!root.children?.length) {
      return {
        name: root.folder?.name || 'root',
        uuid: root.folder?.uuid || undefined,
        documents: root.entries.map((d) => ({ name: d.name, uuid: d.uuid, type: d.collectionName }))
      };
    }

    const folders = root.children.map((f) => _recurse(f));
    const documents = root.entries.map((d) => ({ name: d.name, uuid: d.uuid, type: d.collectionName }))

    return {
      name: root.folder?.name || 'root',
      uuid: root.folder?.uuid || undefined,
      folders,
      documents
    };
  };

  return _recurse(tree);
}
