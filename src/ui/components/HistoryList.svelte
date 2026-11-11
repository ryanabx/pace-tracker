<script lang="ts">
    let {
        pressTimes,
        displayCount,
        onShowMore,
        onShowLess,
    }: {
        pressTimes: number[];
        displayCount: number;
        onShowMore: () => void;
        onShowLess: () => void;
    } = $props();

    let reversedTimes = $derived([...pressTimes].reverse());
    let timesToDisplay = $derived(reversedTimes.slice(0, displayCount));
    let hasMore = $derived(reversedTimes.length > displayCount);

    const formatInterval = (timestamp1: number, timestamp2: number): string => {
        const diff = timestamp1 - timestamp2;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const parts: string[] = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

        return parts.join(' ');
    };
</script>

<ul class="history-list">
    {#each timesToDisplay as time, index (`${time}-${index}`)}
        <li class="history-item">
            <div class="primary">{new Date(time).toLocaleString()}</div>
            {#if pressTimes.length > 1 && index > 0}
                <div class="secondary">Interval: {formatInterval(reversedTimes[index - 1], time)}</div>
            {/if}
        </li>
    {/each}
</ul>

{#if hasMore}
    <div class="show-toggle">
        <button class="show-btn" onclick={onShowMore} aria-label="Show more">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="currentColor" d="M7.41,7.84L12,12.42l4.59,-4.58L18,9.25l-6,6l-6,-6z" />
            </svg>
        </button>
        <span class="show-label">Show More</span>
    </div>
{:else if pressTimes.length > displayCount}
    <div class="show-toggle">
        <button class="show-btn" onclick={onShowLess} aria-label="Show less">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="currentColor" d="M12,8l-6,6L1.5,13.5L12,24l10.5,-10.5L17.41,14z" transform="translate(0 -7)" />
            </svg>
        </button>
        <span class="show-label">Show Less</span>
    </div>
{/if}

<style>
    .history-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .history-item {
        background-color: var(--row-bg);
        border-radius: 0.25rem;
        padding: 0.5rem 0.75rem;
    }

    .primary {
        font-size: 0.9rem;
    }

    .secondary {
        font-size: 0.8rem;
        color: var(--text-secondary);
    }

    .show-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        margin-top: 0.5rem;
    }

    .show-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--primary);
        cursor: pointer;
        padding: 0;
    }

    .show-btn:hover {
        background: var(--selected-bg);
    }

    .show-label {
        font-size: 0.75rem;
        color: var(--text-secondary);
    }
</style>
