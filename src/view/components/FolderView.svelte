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
            <label for="folder-{folder.uuid}"> {folder.name}</label>
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

            <label for="document-{uuid}">{name}</label>
        </li>
    {/each}
</ul>

<style lang="scss">
    .bm-tree-view {
        display: flex;
        align-items: center;
        list-style: none;

        &__folder {
            color: blue;
        }

        &__file {
        }
    }
</style>
