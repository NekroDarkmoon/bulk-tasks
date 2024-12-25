<script lang="ts">
import { SvelteSet } from 'svelte/reactivity';

import { BulkTasksManager } from '../managers/TaskManager.ts';
import { buildDirectory } from '../utils/buildDirectory.ts';
import { localize } from '../utils/localize.ts';

import FolderView from './components/FolderView.svelte';
import SecondaryNav from './components/SecondaryNav.svelte';

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
</script>

<section class="bm-dialog-body bm-dialog-body__duplicate">
    <SecondaryNav {currentSecondaryTab} bind:directory={directory}/>

    <div class="bmd-dialog-body__split-view">
        <div class="bm-directory-view">
            <FolderView {directory} {selected} />
        </div>

        <div class="bm-options-view">

        </div>
    </div>

    <footer>
        <button onclick={() => BulkTasksManager.deleteDocuments(new Set(selected))}>
            {localize("BulkTasks.delete")}
        </button>
    </footer>
</section>

<style lang="scss">
    .bm-directory-view {
        overflow-y: scroll;
        flex-grow: 1;
    }

    footer {

    }
</style>
