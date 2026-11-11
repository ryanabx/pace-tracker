<script lang="ts">
    import List, { Item, Text, PrimaryText, SecondaryText } from '@smui/list';
    import IconButton from '@smui/icon-button';
    import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
    import Mdi from './Mdi.svelte';

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

<List class="history-list" twoLine>
    {#each timesToDisplay as time, index (`${time}-${index}`)}
        <Item>
            <Text>
                <PrimaryText>{new Date(time).toLocaleString()}</PrimaryText>
                {#if pressTimes.length > 1 && index > 0}
                    <SecondaryText>Interval: {formatInterval(reversedTimes[index - 1], time)}</SecondaryText>
                {/if}
            </Text>
        </Item>
    {/each}
</List>

{#if hasMore}
    <div class="show-toggle">
        <IconButton title="Show more" onclick={onShowMore}>
            <Mdi d={mdiChevronDown} />
        </IconButton>
        <span class="show-label">Show More</span>
    </div>
{:else if pressTimes.length > displayCount}
    <div class="show-toggle">
        <IconButton title="Show less" onclick={onShowLess}>
            <Mdi d={mdiChevronUp} />
        </IconButton>
        <span class="show-label">Show Less</span>
    </div>
{/if}

<style>
    :global(.history-list .mdc-deprecated-list-item) {
        border-radius: 0.25rem;
    }

    .show-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        margin-top: 0.5rem;
    }

    .show-label {
        font-size: 0.75rem;
        color: var(--mdc-theme-text-secondary-on-background, rgba(0, 0, 0, 0.54));
    }
</style>
