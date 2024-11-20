<script lang="ts">
    import { setContext } from "svelte";
    import { SvelteSet } from "svelte/reactivity";

    import { BulkTasksManager } from "../managers/TaskManager.ts";

    import FolderView from "./components/FolderView.svelte";

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

    let { directory } = $props();

    let selected = new SvelteSet<string>();
</script>

<div>
    <header>
        <button onclick={() => selectAll(directory, true)}> Select All</button>
        <button onclick={() => selectAll(directory, false)}>De-Select All</button>
    </header>

    <div class="bm-directory-view">
        <FolderView {directory} {selected} />
    </div>

    <footer>
        <button onclick={() => BulkTasksManager.deleteDocuments(new Set(selected))}>
            Delete
        </button>
    </footer>
</div>

<style lang="scss">
    header {
        display: flex;
    }

    .bm-directory-view {
    }
</style>
