<script lang="ts">
    interface BarDatum {
        label: string;
        value: number;
        msValue?: number;
    }

    let {
        data,
        formatValue,
        formatTick,
    }: {
        data: BarDatum[];
        formatValue: (d: BarDatum) => string;
        formatTick: (v: number) => string;
    } = $props();

    const BAR_COLORS = ['#1976d2', '#42a5f5', '#64b5f6', '#90caf9', '#bbdefb'];
    const TICK_COUNT = 4;

    // Round the max up to a "nice" number (1, 2 or 5 x 10^n)
    let niceMax = $derived.by(() => {
        const raw = Math.max(...data.map((d) => d.value), 1);
        const magnitude = 10 ** Math.floor(Math.log10(raw));
        const norm = raw / magnitude;
        const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
        return nice * magnitude;
    });

    let ticks = $derived(
        Array.from({ length: TICK_COUNT + 1 }, (_, i) => niceMax * (1 - i / TICK_COUNT))
    );

    // Show a subset of x-axis labels so they don't overlap
    let labelStep = $derived(Math.max(1, Math.ceil(data.length / 7)));
    const showLabel = (index: number) =>
        index % labelStep === 0 || index === data.length - 1;

    let hovered = $state<number | null>(null);
</script>

<div class="bar-chart">
    <div class="y-axis" aria-hidden="true">
        {#each ticks as tick (tick)}
            <span>{formatTick(tick)}</span>
        {/each}
    </div>
    <div class="plot">
        {#each ticks as _, i (i)}
            <div class="grid-line" style="bottom: {(i / TICK_COUNT) * 100}%"></div>
        {/each}
        <div class="bars">
            {#each data as d, i (d.label + i)}
                <div
                    class="bar-col"
                    role="img"
                    aria-label={`${d.label}: ${formatValue(d)}`}
                    tabindex="0"
                    onmouseenter={() => (hovered = i)}
                    onmouseleave={() => (hovered = null)}
                    onfocus={() => (hovered = i)}
                    onblur={() => (hovered = null)}
                >
                    <div
                        class="bar"
                        style="height: {Math.max(0, (d.value / niceMax) * 100)}%; background-color: {BAR_COLORS[i % BAR_COLORS.length]}"
                    ></div>
                </div>
            {/each}
        </div>
        {#if hovered !== null}
            <div class="tooltip" style="left: {((hovered + 0.5) / data.length) * 100}%">
                <strong>{data[hovered].label}</strong>
                <span>{formatValue(data[hovered])}</span>
            </div>
        {/if}
    </div>
    <div></div>
    <div class="x-axis" aria-hidden="true">
        {#each data as d, i (d.label + i)}
            <span>{showLabel(i) ? d.label : ''}</span>
        {/each}
    </div>
</div>

<style>
    .bar-chart {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: 1fr auto;
        height: 100%;
        width: 100%;
    }

    .y-axis {
        grid-row: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-end;
        font-size: 0.7rem;
        color: var(--text-secondary);
        padding: 0 0.5rem 1.1rem 0;
    }

    .plot {
        grid-row: 1;
        grid-column: 2;
        position: relative;
    }

    .grid-line {
        position: absolute;
        left: 0;
        right: 0;
        border-top: 1px dashed rgba(128, 128, 128, 0.2);
    }

    .bars {
        position: absolute;
        inset: 0 0 0 0;
        display: flex;
        align-items: flex-end;
        gap: 2px;
    }

    .bar-col {
        flex: 1;
        min-width: 0;
        height: 100%;
        display: flex;
        align-items: flex-end;
        cursor: pointer;
    }

    .bar-col:focus-visible {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
        border-radius: 4px;
    }

    .bar {
        width: 100%;
        max-width: 50px;
        margin: 0 auto;
        border-radius: 4px 4px 0 0;
        min-height: 2px;
    }

    .x-axis {
        grid-row: 2;
        grid-column: 2;
        display: flex;
        gap: 2px;
        padding-top: 0.25rem;
    }

    .x-axis span {
        flex: 1;
        min-width: 0;
        text-align: center;
        font-size: 0.7rem;
        color: var(--text-secondary);
        overflow: hidden;
        white-space: nowrap;
    }

    .tooltip {
        position: absolute;
        top: 0;
        transform: translateX(-50%);
        background-color: var(--paper);
        border: 1px solid var(--divider);
        border-radius: 0.375rem;
        box-shadow: 0 3px 5px rgba(0, 0, 0, 0.15);
        padding: 0.5rem 0.75rem;
        font-size: 0.8rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: none;
        z-index: 5;
        white-space: nowrap;
    }

    .tooltip strong {
        font-weight: 600;
    }

    .tooltip span {
        color: var(--text-secondary);
    }
</style>
