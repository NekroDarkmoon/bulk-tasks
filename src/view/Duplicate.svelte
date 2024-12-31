<script lang="ts">
import { SvelteSet } from 'svelte/reactivity';

import { BulkTasksManager } from '../managers/TaskManager.ts';
import { buildDirectory } from '../utils/buildDirectory.ts';
import { localize } from '../utils/localize.ts';

import FolderView from './components/FolderView.svelte';
import FolderViewHeader from './components/FolderViewHeader.svelte';
import SecondaryNav from './components/SecondaryNav.svelte';

async function duplicateDocs() {
	const options = {
		namingConvention,
		numCopies,
		duplicateToRoot,
		resetImages,
	};

	await BulkTasksManager.duplicateDocuments(new Set(selected), options);
	directory = buildDirectory(currentSecondaryTab);
}

let { currentSecondaryTab } = $props();

let selected = new SvelteSet<string>();
let directory = $state(buildDirectory(currentSecondaryTab));
let namingConvention = $state('{name} {index}');
let numCopies = $state(1);
let duplicateToRoot = $state(false);
let resetImages = $state(false);
let searchParam = $state('');
</script>

<section class="bm-dialog-body bm-dialog-body__duplicate">
    <SecondaryNav {currentSecondaryTab} bind:directory={directory}/>

    <FolderViewHeader {directory} {selected} bind:searchParam={searchParam}/>

    <div class="bm-directory-view">
        <FolderView {directory} {selected} {searchParam}/>
    </div>

    <div class="bm-config-view">
        <label class="bm-config-view__label">
            <span>
                Naming Convention
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
        </label>

        <label class="bm-config-view__label">
            <span>Number of Copies</span>

            <input
                class="bm-config-view__input"
                type="number"
                bind:value={numCopies}
            />
        </label>

        <label class="bm-config-view__label bm-config-view__label--row">
            <input
                class="bm-config-view__input"
                bind:checked={duplicateToRoot}
                type="checkbox"
            >

            <span>
                Duplicate to root
                <i
                    class="fa-solid fa-circle-question"
                    data-tooltip="Duplicate files to outside of any folder."
                >
                </i>
            </span>
        </label>

        <label class="bm-config-view__label bm-config-view__label--row">
            <input
                class="bm-config-view__input"
                bind:checked={resetImages}
                type="checkbox"
            >

            <span>
                Reset Images
                <i
                    class="fa-solid fa-circle-question"
                    data-tooltip="Reset the main document's image to the default image."
                >
                </i>
            </span>
        </label>
    </div>

    <footer>
        <button onclick={duplicateDocs}>
            {localize("BulkTasks.duplicate")}
        </button>
    </footer>
</section>

<style lang="scss">
    .bm-directory-view {
        grid-area: directory;
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
