<script lang="ts">
import { SvelteSet } from 'svelte/reactivity';

import { BulkTasksManager } from '../managers/TaskManager.ts';
import { buildDirectory } from '../utils/buildDirectory.ts';
import { localize } from '../utils/localize.ts';

import FolderView from './components/FolderView.svelte';
import FolderViewHeader from './components/FolderViewHeader.svelte';
import SecondaryNav from './components/SecondaryNav.svelte';

async function deleteDocs() {
	await BulkTasksManager.deleteDocuments(new Set(selected));
	selected.clear();
	directory = buildDirectory(currentSecondaryTab);
}

let { currentSecondaryTab } = $props();

let selected = new SvelteSet<string>();
let directory = $state(buildDirectory(currentSecondaryTab));
let searchParam = $state('');
</script>

<section class="bm-dialog-body">
    <SecondaryNav {currentSecondaryTab} bind:directory={directory}/>

    <FolderViewHeader {directory} {selected} bind:searchParam={searchParam}/>

    {#key currentSecondaryTab}
        <div class="bm-directory-view">
            <FolderView {directory} {selected} {searchParam} />
        </div>
    {/key}

    <footer>
        <button onclick={deleteDocs}>
            {localize("BulkTasks.delete")}
        </button>
    </footer>
</section>

<style lang="scss">
    .bm-directory-view {
        grid-area: directory;
        overflow-y: scroll;
        flex-grow: 1;
    }

    footer {
        grid-area: footer;
    }
</style>
