<script lang="ts">
    import { setContext } from "svelte";

    import FolderView from "./components/FolderView.svelte";

    let { directory } = $props();

    let selected = new Set<string>();
</script>

<FolderView {directory} {selected} />

<style lang="scss">
</style>
