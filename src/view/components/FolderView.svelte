<script lang="ts">
import FolderView from './FolderView.svelte';

function selectDocument(uuid: string) {
	if (selected.has(uuid)) selected.delete(uuid);
	else selected.add(uuid);
}

function selectFolder(folder, operation: boolean | undefined = undefined) {
	operation ??= !selected.has(folder.uuid);

	if (operation) {
		selected.add(folder.uuid);
		folder.documents.forEach((d) => selected.add(d.uuid));
	} else {
		selected.delete(folder.uuid);
		folder.documents.forEach((d) => selected.delete(d.uuid));
	}

	(folder.folders ?? []).forEach((f) => selectFolder(f, operation));
}

let { directory, selected } = $props();
</script>

<ul>
    {#each directory.folders as folder}
        <li
            class="bm-tree-view bm-tree-view__folder"
            data-uuid={folder.uuid}
            data-type="folders"
        >
            <input
                id="folder-{folder.uuid}"
                type="checkbox"
                checked={selected.has(folder.uuid)}
                onchange={() => selectFolder(folder)}
            />

            <i class="fa-regular fa-folder"></i>

            <label for="folder-{folder.uuid}"> {folder.name}</label>

            <!-- <i class="bm-chevron fa-solid" class:fa-chevron-down={true}></i> -->
        </li>

        <FolderView directory={folder} {selected} />
    {/each}

    {#each directory.documents as { uuid, name, type }}
        <li class="bm-tree-view bm-tree-view__document" data-uuid="uuid" data-type={type}>
            <input
                id="document-{uuid}"
                type="checkbox"
                checked={selected.has(uuid)}
                onchange={() => selectDocument(uuid)}
            />

            <i class="fa-regular fa-file"></i>

            <label for="document-{uuid}">{name}</label>
        </li>
    {/each}
</ul>

<style lang="scss">
    ul {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding-inline: 0.5rem;
        margin: 0;
    }

    .bm-tree-view {
        display: flex;
        align-items: center;
        list-style: none;
        margin: 0;

        &__folder {
            display: flex;
            gap: 0.25rem;
            align-items: center;
        }

        &__document {
            display: flex;
            gap: 0.25rem;
            align-items: center;
        }
    }

    // .bm-chevron {
    //     font-size: var(--bulk-tasks-sm-text);
    // }
</style>
