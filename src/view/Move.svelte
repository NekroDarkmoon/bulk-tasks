<script lang="ts">
import { SvelteSet } from 'svelte/reactivity';

import { BulkTasksManager } from '../managers/TaskManager.ts';
import { buildDirectory } from '../utils/buildDirectory.ts';
import { localize } from '../utils/localize.ts';

import FolderView from './components/FolderView.svelte';
import FolderViewHeader from './components/FolderViewHeader.svelte';
import SecondaryNav from './components/SecondaryNav.svelte';

function getFolderList() {
	return game.folders.reduce(
		(acc, folder) => {
			// @ts-expect-error
			const type = folder.documentCollection?.documentClass.collectionName;
			if (!type) return acc;
			if (type !== currentSecondaryTab) return acc;

			acc.push({ id: folder._id, name: folder.name });
			return acc;
		},
		[{ id: null, name: 'Root' }] as any[],
	);
}

async function moveDocs() {
	await BulkTasksManager.moveDocuments(new Set(selected), folderId);
	directory = buildDirectory(currentSecondaryTab);
}

let { currentSecondaryTab = $bindable() } = $props();

let directory = $state(buildDirectory(currentSecondaryTab));
let searchParam = $state('');
let selected = $state(new SvelteSet<string>());
let folderId = $state('');
let folderOptions = $derived(getFolderList());

$effect(() => {
	currentSecondaryTab;
	selected = new SvelteSet<string>();
	folderId = '';
});
</script>

<section class="bm-dialog-body bm-dialog-body__move">
    <SecondaryNav bind:currentSecondaryTab={currentSecondaryTab} bind:directory={directory}/>

    <FolderViewHeader {directory} {selected} bind:searchParam={searchParam}/>

    <div class="bm-directory-view">
        <FolderView {directory} {selected} {searchParam}/>
    </div>

    <label class="bm-folder-select">
        <span>
            Selected Folder:
        </span>

        <select class="bm-folder-select--select-box" bind:value={folderId}>
            {#each folderOptions as folder}
            <option value={folder.id}> {folder.name}</option>
            {/each}
        </select>
    </label>

    <footer>
        <button onclick={moveDocs}>
            {localize("BulkTasks.move")}
        </button>
    </footer>
</section>

<style lang="scss">
    // header {
    //     display: flex;
    // }

    .bm-directory-view {
        grid-area: directory;

        overflow-y: scroll;
        flex-grow: 1;
    }

    .bm-folder-select {
        grid-area: config;

        display: flex;
        gap: 0.5rem;
        padding-left: 0.25rem;
        align-items: center;
        font-size: var(--bulk-tasks-sm-text);

        span {
            width: max-content;
            text-wrap: nowrap;
        }

        &--select-box {
            height: var(--bulk-tasks-xl-text);
        }
    }

    footer {
        grid-area: footer;
    }
</style>
