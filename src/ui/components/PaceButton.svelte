<script lang="ts">
    import Fab, { Icon } from '@smui/fab';
    import { mdiPlus } from '@mdi/js';
    import { formatTime } from '../../core/tracker';

    let { onPaceClick, elapsed }: { onPaceClick: () => void; elapsed?: number } = $props();
</script>

<div class="pace">
    <Fab class="hit-fab" color="primary" title="Record a new hit" onclick={onPaceClick}>
        <Icon class="hit-icon" tag="svg" viewBox="0 0 24 24">
            <path fill="currentColor" d={mdiPlus} />
        </Icon>
    </Fab>
    {#if elapsed !== undefined && elapsed >= 0}
        <div class="elapsed">{formatTime(elapsed)}</div>
    {/if}
</div>

<style>
    .pace {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    :global(.hit-fab) {
        width: 72px;
        height: 72px;
    }

    :global(.hit-fab .hit-icon) {
        font-size: 32px;
        width: 32px;
        height: 32px;
    }

    :global(.hit-fab:active) {
        transform: scale(0.96);
    }

    .elapsed {
        font-weight: 600;
        color: var(--mdc-theme-primary);
        font-family: monospace;
        font-size: 1.25rem;
    }
</style>
