import { moduleId } from './constants.ts';

export function registerSettings() {
	game.settings?.register(moduleId, 'defaultExportNamingConvention', {
		name: 'BulkTasks.settings.defaultExportNamingConvention.title',
		scope: 'world',
		config: true,
		type: String,
		default: '{foundry}',
	});

	game.settings?.register(moduleId, 'defaultExportZipName', {
		name: 'BulkTasks.settings.defaultExportZipName.title',
		scope: 'world',
		config: true,
		type: String,
		default: 'bulk-tasks-export',
	});

	game.settings?.register(moduleId, 'defaultDuplicateNamingConvention', {
		name: 'BulkTasks.settings.defaultDuplicateNamingConvention.title',
		scope: 'world',
		config: true,
		type: String,
		default: '{name} {index}',
	});

	game.settings?.register(moduleId, 'defaultRenameNamingConvention', {
		name: 'BulkTasks.settings.defaultRenameNamingConvention.title',
		scope: 'world',
		config: true,
		type: String,
		default: '{name}',
	});

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

	game.settings?.register(moduleId, 'keepIdsOnImport', {
		name: 'BulkTasks.settings.keepIdsOnImport.title',
		scope: 'world',
		config: true,
		type: Boolean,
		default: false,
	});
}
