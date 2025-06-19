<script lang="ts">
    import { SvelteSet } from "svelte/reactivity";

    import { BulkTasksManager } from "../managers/TaskManager.ts";
    import { buildDirectory } from "../utils/buildDirectory.ts";
    import { localize } from "../utils/localize.ts";

    import FolderView from "./components/FolderView.svelte";
    import FolderViewHeader from "./components/FolderViewHeader.svelte";
    import SecondaryNav from "./components/SecondaryNav.svelte";

    async function renameDocs() {
        const options = {
            namingConvention,
        };

        await BulkTasksManager.renameDocuments(new Set(selected), options);
        directory = buildDirectory(currentSecondaryTab);
    }

    let { currentSecondaryTab } = $props();

    let selected = new SvelteSet<string>();
    let directory = $state(buildDirectory(currentSecondaryTab));
    let namingConvention = $state("{name}");
    let searchParam = $state("");
</script>

<section class="bm-dialog-body bm-dialog-body__rename">
    <SecondaryNav {currentSecondaryTab} bind:directory />

    <FolderViewHeader {directory} {selected} bind:searchParam />

    <div class="bm-directory-view">
        <FolderView {directory} {selected} {searchParam} />
    </div>

    <div class="bm-config-view">
        <label class="bm-config-view__label">
            <span>
                Naming Convention
                <i
                    class="fa-solid fa-circle-question"
                    data-tooltip={BulkTasksManager.namingConventionHint}
                >
                </i>
            </span>

            <input
                class="bm-config-view__input"
                type="text"
                bind:value={namingConvention}
            />
        </label>
    </div>

    <footer>
        <button class="bulk-tasks-button" onclick={renameDocs}>
            {localize("BulkTasks.rename")}
        </button>
    </footer>
</section>

<style lang="scss">
    .bm-directory-view {
        grid-area: directory;
        overflow-y: scroll;
        flex-grow: 1;
    }

    .bm-config-view {
        grid-area: config;

        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        width: 15rem;
        padding-inline: 0.5rem;
        border-left: 1px solid #ccc;
        font-size: var(--bulk-tasks-sm-text);

        // input[type="number"],
        input[type="text"] {
            font-size: var(--bulk-tasks-sm-text);
            height: 1.7rem;
        }

        // input[type="number"] {
        //     width: 5rem;
        //     text-align: center;
        // }

        // input[type="checkbox"] {
        //     margin: 0;
        //     padding: 0.125rem;
        // }

        &__label {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;

            // &--row {
            //     align-items: center;
            //     flex-direction: row;
            // }
        }
    }

    footer {
        grid-area: footer;
    }
</style>
