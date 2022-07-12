// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleTag, moduleName } from './modules/constants.js';
import { MainMenu } from './modules/mainMenu.js';
import { registerSettings } from './modules/settings.mjs';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                     Main
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Hooks.on('init', async () => {
	await registerSettings();
	console.log(`${moduleTag} | Initialized.`);
});

Hooks.on('renderSidebarTab', async (app, html) => {
	addBulkButton(app, html);
});

Hooks.on('setup', async () => {
	console.log(`${moduleTag} | Setup Complete.`);
});

Hooks.on('ready', async () => {
	console.log(`${moduleTag} | Ready.`);
});

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Add Bulk button
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 *
 * @param {*} app
 * @param {*} html
 * @returns
 */
function addBulkButton(app, html) {
	// Check for preferences
	const forGm = game.settings.get(moduleName, 'gmOnly');
	if (forGm && !game.user.isGM) {
		return;
	}

	if (
		[
			'scenes',
			'actors',
			'items',
			'journal',
			'tables',
			'playlists',
			'macros-popout',
		].includes(app.tabName)
	) {
		let button = $(
			"<button class='bulk-tasks'><i class='fas fa-edit'></i></i> Bulk Tasks</button>"
		);

		button.click(async () => {
			// Render Menu
			// new BulkMenu().render(true);
			new MainMenu().render(true);
		});

		// Render Button
		$(html).find('.header-actions').append(button);
	}
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
