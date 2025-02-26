import { moduleId } from './constants.ts';

export function registerSettings() {
	game.settings?.register(moduleId, 'defaultExportNamingConvention', {
		name: 'BulkTasks.settings.defaultExportNamingConvention.title',
		scope: 'world',
		config: true,
		type: String,
		default: '{foundry}',
	});

	/*
	 * The name 'defaultExportZipName' originates from a time when only ZIP files
	 * could be exported.  Even though this now applies to the file regardless of the
	 * file format, the name has been maintained in order to ensure backwards
	 * compatability with pre-existing configuration.
	 *
	 * Note that the name never included the '.zip' suffix.
	 */
	game.settings?.register(moduleId, 'defaultExportZipName', {
		name: 'BulkTasks.settings.defaultExportFileName.title',
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
}
