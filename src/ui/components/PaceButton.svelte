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
        <div class="elapsed-caption">time since last hit</div>
    {:else}
        <div class="hint">Tap to record your first hit</div>
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
        margin-bottom: 0.5rem;
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

    .elapsed-caption {
        font-size: 0.75rem;
        letter-spacing: 0.02em;
        color: var(--mdc-theme-text-secondary-on-background, rgba(0, 0, 0, 0.54));
    }

    .hint {
        font-size: 0.875rem;
        color: var(--mdc-theme-text-secondary-on-background, rgba(0, 0, 0, 0.54));
    }
</style>
