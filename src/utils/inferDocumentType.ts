const isActor = (source: Record<string, any>): boolean => {
	return (
		'system' in source &&
		'prototypeToken' in source &&
		'items' in source &&
		Array.isArray(source.items)
	);
};

const isItem = (source: Record<string, any>): boolean => {
	return (
		'system' in source &&
		'type' in source &&
		!('text' in source) &&
		!('pages' in source) &&
		!isActor(source)
	);
};

const isJournal = (source: Record<string, any>): boolean => {
	return 'pages' in source && Array.isArray(source.pages) && 'text' in source;
};

const isMacro = (source: Record<string, any>): boolean => {
	return 'command' in source && 'scope' in source;
};

const isScene = (source: Record<string, any>): boolean => {
	return 'grid' in source && 'fog' in source;
};

const isPlaylist = (source: Record<string, any>): boolean => {
	return 'channel' in source && 'playing' in source && 'seed' in source && 'sounds' in source;
};

const isRollTable = (source: Record<string, any>): boolean => {
	return 'results' in source && 'displayRoll' in source && 'replacement' in source;
};

const isFolder = (source: Record<string, any>): boolean => {
	/* Refer to: https://foundryvtt.com/api/interfaces/foundry.types.FolderData.html */
	return 'name' in source && 'type' in source && 'sorting' in source;
};

export function inferDocumentType(doc): string | undefined {
	if (isActor(doc)) return 'Actor';
	if (isItem(doc)) return 'Item';
	if (isJournal(doc)) return 'Journal';
	if (isMacro(doc)) return 'Macro';
	if (isScene(doc)) return 'Scene';
	if (isPlaylist(doc)) return 'Playlist';
	if (isRollTable(doc)) return 'RollTable';
	if (isFolder(doc)) return 'Folder';
	return undefined;
}
