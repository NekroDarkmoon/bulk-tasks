<script lang="ts">
function selectAll(folder, operation) {
	operation ??= !selected.has(folder.uuid);

	if (operation) {
		selected.add(folder.uuid);
		folder.entries.forEach((d) => selected.add(d.uuid));
	} else {
		selected.delete(folder.uuid);
		folder.entries.forEach((d) => selected.delete(d.uuid));
	}

	(folder.children ?? []).forEach((f) => selectAll(f, operation));
}

let { directory, selected, searchParam = $bindable() } = $props();
</script>

<header>
    <div class="bm-header__search">
        <input
            placeholder="Search ..."
            type="text"
            bind:value={searchParam}
        >
    </div>

    <div class="bm-header__selection-buttons">
        <button onclick={() => selectAll(directory, true)}>Select All</button>
        <button onclick={() => selectAll(directory, false)}>De-Select All</button>
    </div>
</header>

<style lang="scss">
    header {
        grid-area: header;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .bm-header__search {
        input[type="text"] {
            font-size: var(--bulk-tasks-sm-text);
            height: 1.7rem;
        }
    }

    .bm-header__selection-buttons {
        display: flex;

        button {
            font-size: var(--bulk-tasks-sm-text);
        }
    }
</style>
