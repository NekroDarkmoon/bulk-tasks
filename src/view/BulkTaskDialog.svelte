<script lang="ts">
    import { localize } from "../utils/localize.ts";

    import Delete from "./Delete.svelte";
    import Duplicate from "./Duplicate.svelte";
    import Export from "./Export.svelte";
    import Import from "./Import.svelte";
    import Move from "./Move.svelte";
    import Rename from "./Rename.svelte";
    // import Update from './Update.svelte';

    function changePrimaryTab(id: string) {
        currentPrimaryTab = primaryTabs[id] ?? primaryTabs.delete;
    }

    const primaryTabs = {
        delete: {
            id: "delete",
            label: localize("BulkTasks.delete"),
            icon: "fa-solid fa-trash",
            component: Delete,
        },
        duplicate: {
            id: "duplicate",
            label: localize("BulkTasks.duplicate"),
            icon: "fa-solid fa-copy",
            component: Duplicate,
        },
        export: {
            id: "export",
            label: localize("BulkTasks.export"),
            icon: "fa-solid fa-file-export",
            component: Export,
        },
        import: {
            id: "import",
            label: localize("BulkTasks.import"),
            icon: "fa-solid fa-file-import",
            component: Import,
        },
        move: {
            id: "move",
            label: localize("BulkTasks.move"),
            icon: "fa-solid fa-truck",
            component: Move,
        },
        rename: {
            id: "rename",
            label: localize("BulkTasks.rename"),
            icon: "fa-solid fa-t",
            component: Rename,
        },
        // update: {
        // 	id: 'update',
        // 	label: localize('BulkTasks.update'),
        // 	icon: 'fa-solid fa-pen-to-square',
        // 	component: Update,
        // },
    };

    let { secondaryTab } = $props();

    let currentPrimaryTab = $state(primaryTabs.delete);
    let currentSecondaryTab = $state(secondaryTab || "actors");
</script>

<article class="bm-dialog-container">
    <aside class="bm-primary-nav">
        {#each Object.entries(primaryTabs) as [id, { label, icon }]}
            <button
                class="bulk-tasks-button bm-primary-nav__element"
                class:bm-primary-nav__element--selected={id ===
                    currentPrimaryTab.id}
                id="bm-nav-primary-{id}"
                data-tooltip={label}
                data-tooltip-direction="RIGHT"
                aria-label={label}
                onclick={() => changePrimaryTab(id)}
            >
                <i class={icon}></i>
            </button>
        {/each}
    </aside>

    <currentPrimaryTab.component {currentSecondaryTab} />
</article>

<style lang="scss">
    .bm-dialog-container {
        display: grid;
        grid-template-columns: 5rem 1fr;
        gap: 0.25rem;
        position: relative;
        height: 100%;
    }

    .bm-primary-nav {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        background-color: var(--bulk-tasks-primary-nav-background-color);
        color: var(--bulk-tasks-primary-nav-text-color);

        &__element {
            width: 3rem;
            font-size: 1rem;
            aspect-ratio: 1 / 1;
            background-color: var(
                --bulk-tasks-primary-nav-element-background-color
            );
            color: inherit;
            margin-inline: auto;

            &--selected {
                background-color: var(--button-hover-background-color);
            }
        }
    }
</style>
