<script lang="ts">
    import { setContext } from "svelte";

    import FolderView from "./components/FolderView.svelte";

    let { directory } = $props();

    let selected = new Set<string>();
</script>

<!-- Add Select All  -->
<div>
    <header>
        <button> Select All</button>
        <button>De-Select All</button>
    </header>

    <div class="bm-directory-view">
        <FolderView {directory} {selected} />
    </div>

    <!-- Add Delete All -->
    <footer>
        <button> Delete </button>
    </footer>
</div>

<style lang="scss">
    header {
        display: flex;
    }

    .bm-directory-view {
    }
</style>
