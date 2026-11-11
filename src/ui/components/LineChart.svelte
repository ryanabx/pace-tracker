<script lang="ts">
    import type { ChartPoint } from './chartUtils';
    import { niceScale, labelStepFor } from './chartUtils';

    let {
        data,
        formatValue,
        formatTick,
    }: {
        data: ChartPoint[];
        formatValue: (d: ChartPoint) => string;
        formatTick: (v: number) => string;
    } = $props();

    const { max, ticks } = $derived(niceScale(Math.max(...data.map((d) => d.value), 1)));

    const labelStep = $derived(labelStepFor(data.length));
    const showLabel = (index: number) =>
        index % labelStep === 0 || index === data.length - 1;

    // Center of bucket i, as a percentage of the plot width.
    const xPct = (i: number) => ((i + 0.5) / data.length) * 100;
    // Top offset of a value, as a percentage of the plot height.
    const yPct = (v: number) => 100 - (v / max) * 100;

    // Contiguous runs of buckets that have data. Periods without data
    // break the line, so "no clicks" never looks like "fast pace".
    let segments = $derived.by(() => {
        const segs: number[][] = [];
        let current: number[] = [];
        data.forEach((d, i) => {
            if (d.hasData) {
                current.push(i);
            } else if (current.length > 0) {
                segs.push(current);
                current = [];
            }
        });
        if (current.length > 0) segs.push(current);
        return segs;
    });

    const segmentPoints = (seg: number[]) =>
        seg.map((i) => `${xPct(i)},${yPct(data[i].value)}`).join(' ');

    let hovered = $state<number | null>(null);
</script>

<div class="line-chart">
    <div class="y-axis" aria-hidden="true">
        {#each ticks as tick (tick)}
            <span>{formatTick(tick)}</span>
        {/each}
    </div>
    <div class="plot">
        {#each ticks as _, i (i)}
            <div class="grid-line" style="bottom: {(i / (ticks.length - 1)) * 100}%"></div>
        {/each}
        <svg class="line-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {#each segments as seg (seg.join(','))}
                {#if seg.length > 1}
                    <polyline points={segmentPoints(seg)} vector-effect="non-scaling-stroke" />
                {/if}
            {/each}
        </svg>
        {#each data as d, i (d.fullLabel + i)}
            {#if d.hasData}
                <div
                    class:dot--active={hovered === i}
                    class:dot--current={i === data.length - 1}
                    class="dot"
                    style="left: {xPct(i)}%; top: {yPct(d.value)}%"
                    aria-hidden="true"
                ></div>
            {/if}
        {/each}
        <div class="hover-cols">
            {#each data as d, i (d.fullLabel + i)}
                <div
                    class="hover-col"
                    role="img"
                    aria-label={d.hasData ? `${d.fullLabel}: ${formatValue(d)}` : `${d.fullLabel}: no data`}
                    tabindex="0"
                    onmouseenter={() => (hovered = i)}
                    onmouseleave={() => (hovered = null)}
                    onfocus={() => (hovered = i)}
                    onblur={() => (hovered = null)}
                ></div>
            {/each}
        </div>
        {#if hovered !== null}
            <div
                class="tooltip"
                style="left: clamp(56px, {xPct(hovered)}%, calc(100% - 56px))"
            >
                <strong>{data[hovered].fullLabel}</strong>
                <span>
                    {data[hovered].hasData ? formatValue(data[hovered]) : 'No clicks'}
                </span>
            </div>
        {/if}
    </div>
    <div></div>
    <div class="x-axis" aria-hidden="true">
        {#each data as d, i (d.fullLabel + i)}
            <span>{showLabel(i) ? d.label : ''}</span>
        {/each}
    </div>
</div>

<style>
    .line-chart {
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
        color: var(--mdc-theme-text-secondary-on-background, rgba(0, 0, 0, 0.54));
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

    .line-svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
    }

    .line-svg polyline {
        fill: none;
        stroke: var(--mdc-theme-primary, #1976d2);
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    .dot {
        position: absolute;
        width: 10px;
        height: 10px;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background-color: var(--mdc-theme-primary, #1976d2);
        border: 2px solid var(--mdc-theme-surface, #fff);
        pointer-events: none;
        transition: width 100ms, height 100ms;
    }

    .dot--active {
        width: 14px;
        height: 14px;
    }

    /* Highlight the current (partial) period so it isn't mistaken for a
       typical value. */
    .dot--current {
        width: 12px;
        height: 12px;
    }

    .hover-cols {
        position: absolute;
        inset: 0;
        display: flex;
    }

    .hover-col {
        flex: 1;
        min-width: 0;
        height: 100%;
        cursor: pointer;
    }

    .hover-col:focus-visible {
        outline: 2px solid var(--mdc-theme-primary, #1976d2);
        outline-offset: 2px;
        border-radius: 4px;
    }

    .x-axis {
        grid-row: 2;
        grid-column: 2;
        display: flex;
        gap: 2px;
        padding-top: 0.25rem;
    }

    /* Labels are sparse (see labelStepFor), so let them overflow into the
       neighboring empty slots instead of being clipped. */
    .x-axis span {
        flex: 1;
        min-width: 0;
        text-align: center;
        font-size: 0.7rem;
        color: var(--mdc-theme-text-secondary-on-background, rgba(0, 0, 0, 0.54));
        white-space: nowrap;
    }

    .tooltip {
        position: absolute;
        top: 0;
        transform: translateX(-50%);
        background-color: var(--mdc-theme-surface, #fff);
        border: 1px solid var(--mdc-theme-outline, rgba(0, 0, 0, 0.12));
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
        color: var(--mdc-theme-text-secondary-on-background, rgba(0, 0, 0, 0.54));
    }
</style>
