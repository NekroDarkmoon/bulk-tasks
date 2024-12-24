// +++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                      Imports
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++
import './scss/main.scss';
import { moduleId, moduleName } from './constants.ts';
import { registerSettings } from './settings.ts';
import { addBulkButton } from './utils/addBulkButton.ts';
import { BulkTaskDialog } from './dialogs/BulkTasks.svelte.ts';

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                     Type Helpers
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++
declare global {
	interface AssumeHookRan {
		init: never;
	}

	interface AssumeHookRan {
		setup: never;
	}

	interface AssumeHookRan {
		ready: never;
	}
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                        Main
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++
Hooks.on('init', () => {
	registerSettings();
	console.log(`${moduleName} | Initialized.`);
});

Hooks.on('renderSidebarTab', async (app, html) => {
	addBulkButton(app, html);
});

Hooks.on('setup', async () => {
	console.log(`${moduleName} | Setup Complete.`);
});

Hooks.on('ready', async () => {
	console.log(`${moduleName} | Ready.`);
	new BulkTaskDialog().render(true);
});
