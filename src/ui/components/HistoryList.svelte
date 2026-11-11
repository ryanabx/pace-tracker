<script lang="ts">
    import List, { Item, Text, PrimaryText, SecondaryText } from '@smui/list';
    import Button, { Label } from '@smui/button';

    let {
        pressTimes,
        displayCount,
        initialCount,
        onShowMore,
        onShowLess,
    }: {
        pressTimes: number[];
        displayCount: number;
        initialCount: number;
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
    <Button variant="text" class="show-toggle" onclick={onShowMore}>
        <Label>Show more</Label>
    </Button>
{:else if pressTimes.length >= initialCount}
    <Button variant="text" class="show-toggle" onclick={onShowLess}>
        <Label>Show less</Label>
    </Button>
{/if}

<style>
    :global(.history-list .mdc-deprecated-list-item) {
        border-radius: 0.25rem;
    }

    .show-toggle {
        align-self: center;
        margin-top: 0.25rem;
    }
</style>
