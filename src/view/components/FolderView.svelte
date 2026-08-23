<script lang="ts">
    import FolderView from "./FolderView.svelte";

    function nameMatch(name = "", param = "") {
        return name.toLowerCase().includes(param.toLowerCase());
    }

    function folderNameMatch(folder, param = "") {
        if (!param.length) return true;

        const self = nameMatch(folder.name, param);
        const directChild = folder.entries.some((e) =>
            nameMatch(e.name, param),
        );
        const possibleChild = folder.children.some((f) =>
            folderNameMatch(f, param),
        );

        return self || directChild || possibleChild;
    }

    function selectDocument(event: PointerEvent, uuid: string) {
        if (event.shiftKey && lastSelected) {
            selectRange(lastSelected, uuid);
        } else {
            if (selected.has(uuid)) selected.delete(uuid);
            else selected.add(uuid);
        }

        lastSelected = uuid;
    }

    function _selectFolder(folder: any, operation?: boolean) {
        operation ??= !selected.has(folder.uuid);

        if (operation) {
            selected.add(folder.uuid);
            folder.entries.forEach((d) => selected.add(d.uuid));
        } else {
            selected.delete(folder.uuid);
            folder.entries.forEach((d) => selected.delete(d.uuid));
        }

        (folder.children ?? []).forEach((f) => _selectFolder(f, operation));
        lastSelected = folder.uuid;
    }

    function selectFolder(event: PointerEvent, folder: any) {
        if (event.shiftKey && lastSelected) {
            selectRange(lastSelected, folder.uuid);
        } else {
            _selectFolder(folder, !selected.has(folder.uuid));
        }

        lastSelected = folder.uuid;
    }

    function selectRange(from: string, to: string) {
        const items = Array.from(
            document.querySelectorAll<HTMLElement>(".bm-tree-view[data-uuid]"),
        );

        const start = items.findIndex((item) => item.dataset.uuid === from);
        const end = items.findIndex((item) => item.dataset.uuid === to);

        if (start === -1 || end === -1) return;

        const first = Math.min(start, end);
        const last = Math.max(start, end);

        for (let i = first; i <= last; i++) {
            const item = items[i];
            const { uuid, type } = item.dataset;

            if (!uuid) return;
            if (type === "folders") {
                // TODO: Add support for using _selectFolder cant use uuid because we have our own struct
                selected.add(uuid);
            } else selected.add(uuid);
        }
    }

    let {
        directory,
        selected,
        searchParam,
        lastSelected = $bindable(null),
    } = $props();
    let collapsed = $state(directory.children.map((f) => f.collapsed));

    // let lastSelected: string | null = $state(null);
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
                    onclick={(event) => selectFolder(event, folder)}
                />

                <i class="fa-regular fa-folder"></i>

                <label for="folder-{folder.uuid}"> {folder.name}</label>

                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <i
                    class="bm-chevron fa-solid"
                    class:fa-chevron-down={!collapsed[idx]}
                    class:fa-chevron-up={collapsed[idx]}
                    onclick={() => (collapsed[idx] = !collapsed[idx])}
                ></i>
            </li>

            {#if !collapsed[idx]}
                <FolderView
                    directory={folder}
                    {selected}
                    {searchParam}
                    bind:lastSelected
                />
            {/if}
        {/if}
    {/each}

    {#each directory.entries as { uuid, name, type, visible }}
        {#if nameMatch(name, searchParam) && visible}
            <li
                class="bm-tree-view bm-tree-view__document"
                data-uuid={uuid}
                data-type={type}
            >
                <input
                    id="document-{uuid}"
                    type="checkbox"
                    checked={selected.has(uuid)}
                    onclick={(event) => selectDocument(event, uuid)}
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
