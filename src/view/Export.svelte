<script lang="ts">
import { SvelteSet } from 'svelte/reactivity';

import { BulkTasksManager } from '../managers/TaskManager.ts';
import { buildDirectory } from '../utils/buildDirectory.ts';
import { localize } from '../utils/localize.ts';

import FolderView from './components/FolderView.svelte';
import SecondaryNav from './components/SecondaryNav.svelte';

async function exportDocs() {
	const options = {
		namingConvention,
		preserveFolders,
		preserveMetaData,
		zipName,
	};

	await BulkTasksManager.exportDocuments(new Set(selected), options);
}

function selectAll(folder, operation) {
	operation ??= !selected.has(folder.uuid);

	if (operation) {
		selected.add(folder.uuid);
		folder.documents.forEach((d) => selected.add(d.uuid));
	} else {
		selected.delete(folder.uuid);
		folder.documents.forEach((d) => selected.delete(d.uuid));
	}

	(folder.folders ?? []).forEach((f) => selectAll(f, operation));
}

let { currentSecondaryTab } = $props();

let selected = new SvelteSet<string>();
let directory = $state(buildDirectory(currentSecondaryTab));
let namingConvention = $state(BulkTasksManager.DEFAULTS.EXPORT_NAMING_CONVENTION);
let zipName = $state(BulkTasksManager.DEFAULTS.EXPORT_ZIP_NAME);
let preserveFolders = $state(true);
let preserveMetaData = $state(true);
</script>

<section class="bm-dialog-body bm-dialog-body__export">
    <SecondaryNav {currentSecondaryTab} bind:directory={directory}/>


    <div class="bm-directory-view">
        <header>
            <button onclick={() => selectAll(directory, true)}> Select All</button>
            <button onclick={() => selectAll(directory, false)}>De-Select All</button>
        </header>

        <FolderView {directory} {selected} />
    </div>

    <div class="bm-config-view">
        <label class="bm-config-view__label">
            <span> Zip Name </span>

            <input
                class="bm-config-view__input"
                type="text"
                bind:value={zipName}
            />
        </label>

        <!-- <label class="bm-config-view__label">
            <span>
                File Naming Convention
                <i
                    class="fa-solid fa-circle-question"
                    data-tooltip={BulkTasksManager.namingConventionHint}
                >
                </i>
            </span>

            <input
                class="bm-config-view__input"
                type="text"
                bind:value={namingConvention}
            />
        </label> -->

        <label class="bm-config-view__label bm-config-view__label--row">
            <input
                class="bm-config-view__input"
                bind:checked={preserveFolders}
                type="checkbox"
            >

            <span>Preserve Folder Structure</span>
        </label>

        <label class="bm-config-view__label bm-config-view__label--row">
            <input
                class="bm-config-view__input"
                bind:checked={preserveMetaData}
                type="checkbox"
            >

            <span>Preserve MetaData</span>
        </label>
    </div>

    <footer>
        <button onclick={exportDocs}>
            {localize("BulkTasks.export")}
        </button>
    </footer>
</section>

<style lang="scss">
    header {
        grid-area: header;
        display: flex;
    }

    .bm-directory-view {
        grid-area: directory;

        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        overflow-y: scroll;
        flex-grow: 1;
    }

    .bm-config-view {
        grid-area: config;

        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        width: 15rem;
        padding-inline: 0.5rem;
        border-left: 1px solid #ccc;
        font-size: var(--bulk-tasks-sm-text);

        input[type="number"],
        input[type="text"] {
            font-size: var(--bulk-tasks-sm-text);
            height: 1.7rem;
        }

        input[type="number"] {
            width: 5rem;
            text-align: center;
        }

        input[type="checkbox"] {
            margin: 0;
            padding: 0.125rem;
        }

        &__label {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;

            &--row {
                align-items: center;
                flex-direction: row;
            }
        }
    }

    footer {
        grid-area: footer;

    }
</style>
