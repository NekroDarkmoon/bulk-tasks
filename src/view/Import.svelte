<script lang="ts">
import { BulkTasksManager } from '../managers/TaskManager.ts';
import { extractFileContents } from '../utils/extractFileContents.ts';
import { localize } from '../utils/localize.ts';

async function handleFileSelection(event) {
	event.preventDefault();
	event.stopPropagation();

	loading = true;
	const files = [...event.target.files];
	const updates = await Promise.all(files.map((f) => extractFileContents(f)));
	documents = documents.concat(updates).flat();
	loading = false;
}

async function importData() {
	const options = {
		keepIdsOnImport,
	};

	loading = true;
	await BulkTasksManager.importDocuments(documents, options);
	loading = false;
}

let loading = $state(false);
let documents: any[] = $state([]);
let documentCount = $derived(documents.length);
let keepIdsOnImport = $state(BulkTasksManager.DEFAULTS.KEEP_IDS_ON_IMPORT);
</script>

<section class="bm-dialog-body bm-dialog-body__import">
    <header>
        <label class="bm-drop">
            <input
                class="bm-drop__input"
                data-tooltip="Add Files to Import"
                data-tooltip-direction="DOWN"
                type="file"
                accept=" .json"
                onchange={handleFileSelection}
                multiple
            />

            <i class="bm-drop__icon fa-solid fa-file-arrow-up"></i>
        </label>

        <button
            class="bm-import-button"
            class:bm-import-button--disabled={documentCount === 0}
            data-tooltip={documentCount
                ? "Import"
                : "Nothing to Import"}
            data-tooltip-direction="DOWN"
            onclick={importData}
            disabled={documentCount === 0}
            aria-label="Import"
        >
            <i
                class="bm-import-button__icon fa-solid"
                class:fa-file-import={!loading}
                class:fa-arrows-rotate={loading}
                class:bm-import-button__icon--disabled={documentCount === 0}
            ></i>
        </button>

    </header>

    <div class="bm-config-view">
        <label class="bm-config-view__label bm-config-view__label--row">
            <input
                class="bm-config-view__input"
                bind:checked={keepIdsOnImport}
                type="checkbox"
            >

            <span>
                Keep IDs on import
                <i
                    class="fa-solid fa-circle-question"
                    data-tooltip="Preserve any document IDs in the imported documents."
                >
                </i>
            </span>
        </label>
    </div>

    <div class="bm-document-list">
        <ul>
            {#each documents as document}
                <li>
                    {document.name}
                </li>
            {/each}
        </ul>
    </div>
</section>

<style lang="scss">
    header {
        grid-area: header;

        display: flex;
        gap: 0.25rem;
        column-gap: 0.375rem;
        padding: 0.5rem 0.5rem 0.25rem;
        border-bottom: 1px solid var(--bulk-tasks-import-header-border-color);
    }

    .bm-drop {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        height: 4rem;
        flex-grow: 1;
        flex-shrink: 0;
        background-color: var(--bulk-tasks-import-drop-background-color);
        border: 1px solid var(--bulk-tasks-import-drop-border-color);
        border-radius: 5px;

        &__input {
            position: relative;
            display: block;
            height: 100%;
            width: 100%;
            opacity: 0;
            cursor: pointer;
            z-index: 1;
        }

        &__icon {
            position: absolute;
            font-size: 1.75rem;
            color: var(--bulk-tasks-import-drop-icon-color);
            z-index: 0;
        }
    }

    .bm-import-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 4rem;
        margin: 0;
        padding: 0;
        background-color: var(--bulk-tasks-import-button-background-color);
        border-color: var(--bulk-tasks-import-button-border-color);
        box-shadow: inset 0 0 10px var(--bulk-tasks-import-button-shadow-color);

        &--disabled {
            background-color: var(--bulk-tasks-import-button-background-color-disabled);
            border-color: var(--bulk-tasks-import-button-border-color-disabled);
            box-shadow: inset 0 0 10px var(--bulk-tasks-import-button-shadow-color-disabled);
        }

        &__icon {
            color: var(--bulk-tasks-import-button-icon-color);
            font-size: var(--bulk-tasks-xxl-text);

            &--disabled {
                color: var(--bulk-tasks-import-button-icon-color-disabled);
            }
        }

        &:hover,
        &:focus {
            box-shadow: none;
        }
    }

    .bm-document-list {
        grid-area: directory;

        overflow-y: scroll;
        flex-grow: 1;
        padding-inline: 0.5rem;
    }
</style>
