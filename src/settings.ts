import { moduleId } from './constants.ts';

export function registerSettings() {
	game.settings?.register(moduleId, 'gmOnly', {
		name: 'BulkTasks.settings.gmOnly.title',
		scope: 'world',
		config: true,
		type: Boolean,
		default: false,
	});

	game.settings?.register(moduleId, 'defaultPermDisplay', {
		name: 'BulkTasks.settings.permDefaultName.title',
		scope: 'world',
		config: true,
		type: String,
		choices: {
			gmOnly: 'BulkTasks.settings.permDefaultName.choices.GMOnly',
			all: 'BulkTasks.settings.permDefaultName.choices.all',
		},
		default: 'gmOnly',
	});
}
