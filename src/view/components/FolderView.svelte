<script lang="ts">
import FolderView from './FolderView.svelte';

function nameMatch(name = '', param = '') {
	return name.toLowerCase().includes(param.toLowerCase());
}

function folderNameMatch(folder, param = '') {
	const directChild = folder.entries.some((e) => nameMatch(e.name, param));
	const possibleChild = folder.children.some((f) => folderNameMatch(f, param));

	return directChild || possibleChild;
}

function selectDocument(uuid: string) {
	if (selected.has(uuid)) selected.delete(uuid);
	else selected.add(uuid);
}

function selectFolder(folder, operation: boolean | undefined = undefined) {
	operation ??= !selected.has(folder.uuid);

	if (operation) {
		selected.add(folder.uuid);
		folder.entries.forEach((d) => selected.add(d.uuid));
	} else {
		selected.delete(folder.uuid);
		folder.entries.forEach((d) => selected.delete(d.uuid));
	}

	(folder.children ?? []).forEach((f) => selectFolder(f, operation));
}

let { directory, selected, searchParam } = $props();
let collapsed = $state(directory.children.map((f) => f.collapsed));
</script>

<ul>
    {#each directory.children as folder, idx}
        {#if folder.visible && folderNameMatch(folder, searchParam)}
            <li
                class="bm-tree-view bm-tree-view__folder"
                data-uuid={folder.uuid || undefined}
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

                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <i
                    class="bm-chevron fa-solid"
                    class:fa-chevron-down={!collapsed[idx]}
                    class:fa-chevron-up={collapsed[idx]}
                    onclick={() => collapsed[idx] = !collapsed[idx]}
                ></i>
            </li>

            {#if !collapsed[idx]}
                <FolderView directory={folder} {selected} {searchParam}/>
            {/if}
        {/if}
    {/each}

    {#each directory.entries as { uuid, name, type, visible }}
        {#if nameMatch(name, searchParam) && visible}
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
        {/if}
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
    //     padding-top: 0.5rem;
    //     font-size: var(--bulk-tasks-sm-text);
    // }
</style>
