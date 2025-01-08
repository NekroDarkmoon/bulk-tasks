import type { secondaryTabs } from '../config.ts';
import { moduleId } from '../constants.ts';
import { BulkTaskDialog } from '../dialogs/BulkTasks.svelte.ts';
import { localize } from './localize.ts';

const TABS = [
	'scenes',
	'actors',
	'items',
	'journal',
	'tables',
	'cards',
	'playlists',
	'macros',
] as const;

export function addBulkButton(app, html: JQuery) {
	// @ts-expect-error
	const forGMOnly = game.settings?.get(moduleId, 'gmOnly');

	if (forGMOnly && !game.user?.isGM) return;
	if (!TABS.includes(app.tabName)) return;

	const button = document.createElement('button');
	button.classList.add('bm-dialog-button');

	const i = document.createElement('i');
	i.classList.add('fa-solid');
	i.classList.add('fa-edit');
	button.appendChild(i);

	const span = document.createElement('span');
	span.textContent = localize('BulkTasks.title');
	button.appendChild(span);

	const parent = html.find('.header-actions');
	if (!parent) return;

	parent.append(button);

	// Add Event Listener
	button.addEventListener('click', (e) => {
		e.preventDefault();
		new BulkTaskDialog({ props: { secondaryTab: app.tabName } }).render(true);
	});
}
