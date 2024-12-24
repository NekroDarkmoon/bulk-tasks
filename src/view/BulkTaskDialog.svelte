<script lang="ts">
import { buildDirectory } from '../utils/buildDirectory.ts';
import { localize } from '../utils/localize.ts';

import Delete from './Delete.svelte';
import Duplicate from './Duplicate.svelte';
import Export from './Export.svelte';
import Import from './Import.svelte';
import Move from './Move.svelte';
import Rename from './Rename.svelte';

function changePrimaryTab(id: string) {
	currentPrimaryTab = primaryTabs[id] ?? primaryTabs.delete;
}

function changeSecondaryTab(id: string) {
	currentSecondaryTab = id;
	directory = buildDirectory(id);
}

const primaryTabs = {
	delete: {
		label: localize('BulkTasks.delete'),
		icon: 'fa-solid fa-trash',
		component: Delete,
	},
	duplicate: {
		label: localize('BulkTasks.duplicate'),
		icon: 'fa-solid fa-copy',
		component: Duplicate,
	},
	export: {
		label: localize('BulkTasks.export'),
		icon: 'fa-solid fa-file-export',
		component: Export,
	},
	import: {
		label: localize('BulkTasks.import'),
		icon: 'fa-solid fa-file-import',
		component: Import,
	},
	move: {
		label: localize('BulkTasks.move'),
		icon: 'fa-solid fa-truck',
		component: Move,
	},
	rename: {
		label: localize('BulkTasks.rename'),
		icon: 'fa-solid fa-t',
		component: Rename,
	},
};

const secondaryTabs = {
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
	compendium: {
		label: localize('BulkTasks.secondaryNav.compendium'),
		icon: 'fa-solid fa-atlas',
	},
	macros: {
		label: localize('BulkTasks.secondaryNav.macros'),
		icon: 'fa-solid fa-code',
	},
};

let currentPrimaryTab = $state(primaryTabs.delete);
let currentSecondaryTab = $state('actors');

// svelte-ignore state_referenced_locally
let directory = $state(buildDirectory(currentSecondaryTab));
</script>

<article class="bm-dialog-container">
    <aside class="bm-primary-nav">
        {#each Object.entries(primaryTabs) as [id, { label, icon }]}
            <button
                class="bm-primary-nav__element {icon}"
                id="bm-nav-primary-{id}"
                data-tooltip={label}
                data-tooltip-direction="RIGHT"
                aria-label={label}
                onclick={() => changePrimaryTab(id)}
            >
            </button>
        {/each}
    </aside>

    <section>
        <nav class="bm-secondary-nav">
            {#each Object.entries(secondaryTabs) as [id, { label, icon }]}
                <button
                    class="bm-seconary-nav__element"
                    id="bm-nav-secondary-{id}"
                    onclick={() => changeSecondaryTab(id)}
                >
                    {label}
                </button>
            {/each}
        </nav>

        {currentPrimaryTab.label}
        {currentSecondaryTab}
        <currentPrimaryTab.component {directory} />
    </section>
</article>

<style lang="scss">
    .bm-dialog-container {
        display: grid;
        grid-template-columns: 5rem 1fr;
        gap: 1rem;
        position: relative;
        height: 100%;
    }

    .bm-primary-nav {
        display: flex;
        flex-direction: column;
        justify-content: space-around;

        &__element {
            width: 3rem;
            font-size: 1rem;
            aspect-ratio: 1 / 1;
            background: transparent;
        }
    }

    .bm-secondary-nav {
        display: flex;
    }
</style>
