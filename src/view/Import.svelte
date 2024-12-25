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
	loading = true;
	await BulkTasksManager.importDocuments(documents);
	loading = false;
}

let loading = $state(false);
let documents: any[] = $state([]);
let documentCount = $derived(documents.length);
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
        border-bottom: 1px solid #ccc;
    }

    .bm-drop {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        height: 4rem;
        flex-grow: 1;
        flex-shrink: 0;
        background-color: #ccc;
        border: 1px solid #aaa;
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
            color: #777;
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
        background-color: #4caf50;
        border-color: #449d48;
        box-shadow: inset 0 0 10px #3d8b40;

        &--disabled {
            background-color: #ccc;
            border-color: #bfbfbf;
            box-shadow: inset 0 0 10px #b3b3b3;
        }

        &__icon {
            color: var(--bulk-tasks-light-text-color);
            font-size: var(--bulk-tasks-xxl-text);

            &--disabled {
                color: var(--bulk-tasks-dark-text-color);
            }
        }
    }

    .bm-document-list {
        grid-area: directory;

        overflow-y: scroll;
        flex-grow: 1;
        padding-inline: 0.5rem;
    }
</style>
