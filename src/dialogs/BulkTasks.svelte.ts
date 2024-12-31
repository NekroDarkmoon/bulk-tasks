import type { DeepPartial } from '@league-of-foundry-developers/foundry-vtt-types/src/types/utils.d.mts';
import {
	SvelteApplicationMixin,
	type Configuration,
} from '../lib/SvelteApplicationMixin.svelte.ts';

import BulkTaskDialogComponent from '../view/BulkTaskDialog.svelte';

const { ApplicationV2 } = foundry.applications.api;

export class BulkTaskDialog extends SvelteApplicationMixin(ApplicationV2) {
	declare promise: Promise<any>;

	declare resolve: any;

	constructor(options = {}) {
		super(
			foundry.utils.mergeObject(options, {
				svelte: {
					component: BulkTaskDialogComponent,
				},
				window: {
					title: 'BulkTasks.title',
				},
			}),
		);

		this.props = {
			dialog: this,
			...(options.props ?? {}),
		};

		this.promise = new Promise((resolve) => {
			this.resolve = resolve;
		});
	}

	static override DEFAULT_OPTIONS = {
		classes: ['bulk-tasks-application'],
		window: {
			icon: 'fa-solid fa-edit',
		},
		position: {
			width: 750,
			height: 600,
		},
	};

	async submit(results) {
		this.#resolvePromise(results);
		return super.close();
	}

	override async close(options?: DeepPartial<SvelteApplicationMixin.ClosingOptions>) {
		this.#resolvePromise(null);
		return super.close(options);
	}

	#resolvePromise(data) {
		if (this.resolve) {
			this.resolve(data);
		}
	}
}
