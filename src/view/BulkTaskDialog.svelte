<script lang="ts">
    import { localize } from "../utils/localize.ts";

    import Delete from "./Delete.svelte";
    import Duplicate from "./Duplicate.svelte";
    import Export from "./Export.svelte";
    import Import from "./Import.svelte";
    import Move from "./Move.svelte";
    import Rename from "./Rename.svelte";

    function changePrimaryTab(id: string) {
        currentTab = tabs[id] ?? tabs.delete;
    }

    const tabs = {
        delete: {
            label: localize("BulkTasks.delete"),
            icon: "fa-solid fa-trash",
            component: Delete,
        },
        duplicate: {
            label: localize("BulkTasks.duplicate"),
            icon: "fa-solid fa-copy",
            component: Duplicate,
        },
        export: {
            label: localize("BulkTasks.export"),
            icon: "fa-solid fa-file-export",
            component: Export,
        },
        import: {
            label: localize("BulkTasks.import"),
            icon: "fa-solid fa-file-import",
            component: Import,
        },
        move: {
            label: localize("BulkTasks.move"),
            icon: "fa-solid fa-truck",
            component: Move,
        },
        rename: {
            label: localize("BulkTasks.rename"),
            icon: "fa-solid fa-t",
            component: Rename,
        },
    };

    let currentTab = $state(tabs.delete);
</script>

<article class="bm-dialog-container">
    <aside class="bm-primary-nav">
        {#each Object.entries(tabs) as [id, { label, icon }]}
            <button
                class="bm-primary-nav__element {icon}"
                id="bm-nav-primary-{label}"
                data-tooltip={label}
                data-tooltip-direction="RIGHT"
                aria-label={label}
                onclick={() => changePrimaryTab(id)}
            >
            </button>
        {/each}
    </aside>

    <section>
        {currentTab.label}
        <currentTab.component />
    </section>
</article>

<style lang="scss">
    .bm-dialog-container {
        display: grid;
        grid-template-columns: 5rem 1fr;
        gap: 1rem;
        position: relative;
        height: 100%;
    }

    .bm-primary-nav {
        display: flex;
        flex-direction: column;
        justify-content: space-around;

        &__element {
            width: 3rem;
            font-size: 1rem;
            aspect-ratio: 1 / 1;
            background: transparent;
        }
    }
</style>
