<script lang="ts">
    import { formatTime } from '../../core/tracker';
    import BarChart from './BarChart.svelte';

    interface ChartPoint {
        label: string;
        value: number; // in milliseconds for time-between, in count for hits-per
        msValue?: number; // only for time-between
    }

    interface Bucket {
        hits: number;
        intervals: number[];
    }

    const MS_IN_DAY = 1000 * 60 * 60 * 24;
    const MS_IN_WEEK = MS_IN_DAY * 7;
    const MS_IN_MONTH = MS_IN_DAY * 30;

    type MetricType = 'hits' | 'timeBetween';
    type PeriodGranularity = 'day' | 'week' | 'month';

    const METRIC_TYPES: { value: MetricType; label: string }[] = [
        { value: 'hits', label: 'Hits per Period' },
        { value: 'timeBetween', label: 'Time Between Hits' },
    ];

    const PERIOD_OPTIONS: { value: PeriodGranularity; label: string; range: number }[] = [
        { value: 'day', label: 'Day (last 4 weeks)', range: 28 },
        { value: 'week', label: 'Week (last 6 months)', range: 26 },
        { value: 'month', label: 'Month (last 12 months)', range: 12 },
    ];

    let { pressTimes, now }: { pressTimes: number[]; now: number } = $props();

    let metricType = $state<MetricType>('hits');
    let period = $state<PeriodGranularity>('day');

    const getPeriodMs = (p: PeriodGranularity): number => {
        return p === 'day' ? MS_IN_DAY : p === 'week' ? MS_IN_WEEK : MS_IN_MONTH;
    };

    const formatDateKey = (bucketStart: number, p: PeriodGranularity, offset: number): string => {
        const start = new Date(bucketStart);
        if (offset === 0) return 'Today';
        if (offset === 1 && p === 'day') return 'Yesterday';

        if (p === 'day') {
            return `${start.getMonth() + 1}/${start.getDate()}`;
        }
        if (p === 'week') {
            return `W${start.getMonth() + 1}/${start.getDate()}`;
        }
        return `${start.toLocaleString('default', { month: 'short' })} ${start.getFullYear()}`;
    };

    const bucketPressTimes = (
        times: number[],
        p: PeriodGranularity,
        rangeCount: number,
        nowTs: number,
        compute: MetricType
    ): ChartPoint[] => {
        if (times.length === 0) return [];

        const periodMs = getPeriodMs(p);
        const buckets: Bucket[] = Array.from({ length: rangeCount }, () => ({ hits: 0, intervals: [] }));

        // Assign each press to a bucket by index
        for (const ts of times) {
            const offset = Math.floor((nowTs - ts) / periodMs);
            if (offset >= 0 && offset < rangeCount) {
                buckets[offset].hits += 1;
            }
        }

        // Assign intervals to buckets (midpoint of each interval)
        for (let i = 1; i < times.length; i++) {
            const diff = times[i] - times[i - 1];
            const midTs = times[i] - diff / 2;

            const offset = Math.floor((nowTs - midTs) / periodMs);
            if (offset >= 0 && offset < rangeCount) {
                buckets[offset].intervals.push(diff);
            }
        }

        // Build result array (index 0 = newest, reverse for chart display)
        const result: ChartPoint[] = [];
        for (let i = 0; i < rangeCount; i++) {
            const label = formatDateKey(nowTs - periodMs * i, p, i);
            if (compute === 'hits') {
                result.push({ label, value: buckets[i].hits });
            } else {
                const avg =
                    buckets[i].intervals.length > 0
                        ? buckets[i].intervals.reduce((a, b) => a + b, 0) / buckets[i].intervals.length
                        : 0;
                result.push({ label, value: avg, msValue: avg });
            }
        }

        // Reverse so newest is on the right
        return result.reverse();
    };

    let periodOption = $derived(PERIOD_OPTIONS.find((o) => o.value === period)!);

    let data = $derived(
        bucketPressTimes(pressTimes, period, periodOption.range, now, metricType)
    );

    let hasData = $derived(data.length > 0 && data.some((d) => d.value > 0));

    let nonZero = $derived(data.filter((d) => d.value > 0));
    let total = $derived(nonZero.reduce((sum, d) => sum + d.value, 0));
    let avg = $derived(nonZero.length > 0 ? total / nonZero.length : 0);

    const formatValue = (d: ChartPoint): string => {
        if (metricType === 'hits') {
            return `${d.value} hit${d.value !== 1 ? 's' : ''}`;
        }
        return `Avg: ${d.msValue != null ? formatTime(d.msValue) : 'N/A'}`;
    };

    const formatTick = (v: number): string => {
        if (metricType === 'hits') return `${Math.round(v)}`;
        if (v >= MS_IN_DAY) return `${Math.round(v / MS_IN_DAY)}d`;
        if (v >= 1000 * 60 * 60) return `${Math.round(v / (1000 * 60 * 60))}h`;
        if (v >= 1000 * 60) return `${Math.round(v / (1000 * 60))}m`;
        return `${Math.round(v / 1000)}s`;
    };
</script>

<div class="metrics">
    <!-- Metric type tabs -->
    <div class="metric-tabs" role="tablist">
        {#each METRIC_TYPES as t (t.value)}
            <button
                role="tab"
                aria-selected={metricType === t.value}
                class="metric-tab"
                class:active={metricType === t.value}
                onclick={() => (metricType = t.value)}
            >
                {t.label}
            </button>
        {/each}
    </div>

    <!-- Period selector -->
    <label class="period-label">
        <span>Period</span>
        <select value={period} onchange={(e) => (period = e.currentTarget.value as PeriodGranularity)}>
            {#each PERIOD_OPTIONS as o (o.value)}
                <option value={o.value}>{o.label}</option>
            {/each}
        </select>
    </label>

    <!-- Chart -->
    <div class="chart-area">
        {#if pressTimes.length < 2}
            <p class="empty">Record at least 2 pace hits to see metrics.</p>
        {:else}
            <BarChart {data} {formatValue} {formatTick} />
        {/if}
    </div>

    <!-- Summary row -->
    {#if hasData}
        <div class="summary">
            <div class="stat">
                <div class="stat-label">{metricType === 'hits' ? 'Total hits' : 'Total intervals'}</div>
                <div class="stat-value">{metricType === 'hits' ? total : nonZero.length}</div>
            </div>
            <div class="stat">
                <div class="stat-label">{metricType === 'hits' ? 'Avg hits/period' : 'Avg time between'}</div>
                <div class="stat-value">{metricType === 'hits' ? avg.toFixed(1) : formatTime(avg)}</div>
            </div>
            <div class="stat">
                <div class="stat-label">Periods with data</div>
                <div class="stat-value">{nonZero.length} / {data.length}</div>
            </div>
        </div>
    {/if}
</div>

<style>
    .metrics {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
        padding: 0.5rem 0;
    }

    .metric-tabs {
        display: flex;
        border-bottom: 1px solid var(--divider);
    }

    .metric-tab {
        flex: 1;
        border: none;
        background: transparent;
        color: var(--text-secondary);
        font-size: 0.9rem;
        font-weight: 500;
        padding: 0.75rem 0.5rem;
        cursor: pointer;
        border-bottom: 2px solid transparent;
    }

    .metric-tab:hover {
        background: var(--selected-bg);
    }

    .metric-tab.active {
        color: var(--primary);
        border-bottom-color: var(--primary);
    }

    .period-label {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.875rem;
        max-width: 280px;
    }

    .period-label select {
        flex: 1;
        padding: 0.375rem 0.5rem;
        border-radius: 0.375rem;
        border: 1px solid var(--divider);
        background-color: var(--paper);
        color: var(--text);
        font-size: 0.875rem;
        font-family: inherit;
    }

    .chart-area {
        width: 100%;
        height: 250px;
    }

    @media (min-width: 640px) {
        .chart-area {
            height: 300px;
        }
    }

    .empty {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
        font-size: 0.875rem;
        margin: 0;
        padding: 2rem;
        text-align: center;
    }

    .summary {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        background-color: var(--selected-bg);
    }

    .stat-label {
        font-size: 0.75rem;
        color: var(--text-secondary);
    }

    .stat-value {
        font-size: 1rem;
        font-weight: 600;
        color: var(--primary);
    }
</style>
