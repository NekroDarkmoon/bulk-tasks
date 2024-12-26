import { localize } from './utils/localize.ts';

export const secondaryTabs = {
	scenes: {
		label: localize('BulkTasks.secondaryNav.scenes'),
		icon: 'fa-solid fa-map',
	},
	actors: {
		label: localize('BulkTasks.secondaryNav.actors'),
		icon: 'fa-solid fa-users',
	},
	items: {
		label: localize('BulkTasks.secondaryNav.items'),
		icon: 'fa-solid fa-suitcase',
	},
	journal: {
		label: localize('BulkTasks.secondaryNav.journal'),
		icon: 'fa-solid fa-book',
	},
	tables: {
		label: localize('BulkTasks.secondaryNav.tables'),
		icon: 'fa-solid fa-th-list',
	},
	cards: {
		label: localize('BulkTasks.secondaryNav.cards'),
		icon: 'fa-solid fa-id-badge',
	},
	playlists: {
		label: localize('BulkTasks.secondaryNav.playlists'),
		icon: 'fa-solid fa-music',
	},
	// packs: {
	// 	label: localize('BulkTasks.secondaryNav.compendium'),
	// 	icon: 'fa-solid fa-atlas',
	// },
	macros: {
		label: localize('BulkTasks.secondaryNav.macros'),
		icon: 'fa-solid fa-code',
	},
};
