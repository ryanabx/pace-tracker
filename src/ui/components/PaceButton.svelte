<script lang="ts">
    import Button, { Label, Icon } from '@smui/button';
    import { mdiWatch } from '@mdi/js';
    import { formatTime } from '../../core/tracker';

    let { onPaceClick, elapsed }: { onPaceClick: () => void; elapsed?: number } = $props();
</script>

<div class="pace">
    <Button class="pace-button" variant="raised" onclick={onPaceClick}>
        <Icon tag="svg" viewBox="0 0 24 24">
            <path fill="currentColor" d={mdiWatch} />
        </Icon>
        <Label>Track Pace</Label>
    </Button>
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

    :global(.pace-button) {
        min-width: 180px;
        box-shadow: 0 4px 14px rgba(25, 118, 210, 0.4);
    }

    :global(.pace-button:active) {
        transform: scale(0.97);
    }

    @media (min-width: 640px) {
        .pace {
            gap: 1rem;
        }

        :global(.pace-button) {
            min-width: 200px;
        }
    }

    .elapsed {
        font-weight: 600;
        color: var(--mdc-theme-primary);
        font-family: monospace;
        font-size: 1.25rem;
    }

    @media (min-width: 640px) {
        .elapsed {
            font-size: 1.5rem;
        }
    }
</style>
