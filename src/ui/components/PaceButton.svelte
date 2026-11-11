<script lang="ts">
    import { formatTime } from '../../core/tracker';

    let { onPaceClick, elapsed }: { onPaceClick: () => void; elapsed?: number } = $props();
</script>

<div class="pace">
    <button class="pace-button" onclick={onPaceClick}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
                fill="currentColor"
                d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
        Track Pace
    </button>
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

    .pace-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 180px;
        border: none;
        border-radius: 0.5rem;
        background-color: var(--primary);
        color: #fff;
        font-size: 1rem;
        font-weight: 600;
        padding: 1rem 2rem;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(25, 118, 210, 0.4);
    }

    .pace-button:active {
        transform: scale(0.97);
    }

    @media (min-width: 640px) {
        .pace {
            gap: 1rem;
        }

        .pace-button {
            min-width: 200px;
            font-size: 1.1rem;
            padding: 1.5rem 2.5rem;
        }
    }

    .elapsed {
        font-weight: 600;
        color: var(--primary);
        font-family: monospace;
        font-size: 1.25rem;
    }

    @media (min-width: 640px) {
        .elapsed {
            font-size: 1.5rem;
        }
    }
</style>
