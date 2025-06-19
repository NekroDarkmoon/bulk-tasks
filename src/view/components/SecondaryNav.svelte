<script lang="ts">
    import { secondaryTabs } from "../../config.ts";
    import { buildDirectory } from "../../utils/buildDirectory.ts";

    function changeSecondaryTab(id: string) {
        currentSecondaryTab = id;
        directory = buildDirectory(id);
    }

    let { currentSecondaryTab = $bindable(), directory = $bindable() } =
        $props();
</script>

<nav class="bm-secondary-nav">
    {#each Object.entries(secondaryTabs) as [id, { label, icon }]}
        <button
            class="bulk-tasks-button bm-secondary-nav__element"
            class:bm-secondary-nav__element--selected={id ===
                currentSecondaryTab}
            id="bm-nav=secondary-{id}"
            type="button"
            aria-label={label}
            data-tooltip={label}
            onclick={() => changeSecondaryTab(id)}
        >
            <i class={icon}> </i></button
        >
    {/each}
</nav>

<style lang="scss">
    .bm-secondary-nav {
        grid-area: nav;

        display: flex;
        justify-content: space-between;
        margin-bottom: 0.75rem;

        &__element {
            width: 2rem;
            aspect-ratio: 1 / 1;
            color: inherit;

            &--selected {
                color: var(--bulk-tasks-secondary-nav-selected-text-color);
                background-color: var(--button-hover-background-color);
            }
        }
    }
</style>
