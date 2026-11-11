<script lang="ts">
    import TabBar from '@smui/tab-bar';
    import Tab, { Label } from '@smui/tab';
    import Select, { Option } from '@smui/select';
    import Paper, { Content } from '@smui/paper';
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

    let metricType = $state(METRIC_TYPES[0]);
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
        bucketPressTimes(pressTimes, period, periodOption.range, now, metricType.value)
    );

    let hasData = $derived(data.length > 0 && data.some((d) => d.value > 0));

    let nonZero = $derived(data.filter((d) => d.value > 0));
    let total = $derived(nonZero.reduce((sum, d) => sum + d.value, 0));
    let avg = $derived(nonZero.length > 0 ? total / nonZero.length : 0);

    const formatValue = (d: ChartPoint): string => {
        if (metricType.value === 'hits') {
            return `${d.value} hit${d.value !== 1 ? 's' : ''}`;
        }
        return `Avg: ${d.msValue != null ? formatTime(d.msValue) : 'N/A'}`;
    };

    const formatTick = (v: number): string => {
        if (metricType.value === 'hits') return `${Math.round(v)}`;
        if (v >= MS_IN_DAY) return `${Math.round(v / MS_IN_DAY)}d`;
        if (v >= 1000 * 60 * 60) return `${Math.round(v / (1000 * 60 * 60))}h`;
        if (v >= 1000 * 60) return `${Math.round(v / (1000 * 60))}m`;
        return `${Math.round(v / 1000)}s`;
    };
</script>

<div class="metrics">
    <!-- Metric type tabs -->
    <TabBar class="metric-tabs" tabs={METRIC_TYPES} key={(t) => t.value} bind:active={metricType}>
        {#snippet tab(tab)}
            <Tab {tab}>
                <Label>{tab.label}</Label>
            </Tab>
        {/snippet}
    </TabBar>

    <!-- Period selector -->
    <Select class="period-select" bind:value={period} label="Period">
        {#each PERIOD_OPTIONS as o (o.value)}
            <Option value={o.value}>{o.label}</Option>
        {/each}
    </Select>

    <!-- Chart -->
    <div class="chart-area">
        {#if pressTimes.length < 2}
            <p class="empty mdc-typography--body2">Record at least 2 pace hits to see metrics.</p>
        {:else}
            <BarChart {data} {formatValue} {formatTick} />
        {/if}
    </div>

    <!-- Summary row -->
    {#if hasData}
        <Paper class="summary" variant="unelevated">
            <Content>
                <div class="stat">
                    <div class="stat-label">
                        {metricType.value === 'hits' ? 'Total hits' : 'Total intervals'}
                    </div>
                    <div class="stat-value">
                        {metricType.value === 'hits' ? total : nonZero.length}
                    </div>
                </div>
                <div class="stat">
                    <div class="stat-label">
                        {metricType.value === 'hits' ? 'Avg hits/period' : 'Avg time between'}
                    </div>
                    <div class="stat-value">
                        {metricType.value === 'hits' ? avg.toFixed(1) : formatTime(avg)}
                    </div>
                </div>
                <div class="stat">
                    <div class="stat-label">Periods with data</div>
                    <div class="stat-value">{nonZero.length} / {data.length}</div>
                </div>
            </Content>
        </Paper>
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

    :global(.metric-tabs) {
        border-bottom: 1px solid var(--mdc-theme-outline, rgba(0, 0, 0, 0.12));
    }

    :global(.period-select) {
        min-width: 220px;
        max-width: 320px;
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
        color: var(--mdc-theme-text-secondary-on-background, rgba(0, 0, 0, 0.54));
        margin: 0;
        padding: 2rem;
        text-align: center;
    }

    :global(.summary) {
        border-radius: 0.5rem;
    }

    :global(.summary .smui-paper__content) {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        padding: 0.75rem 1rem;
    }

    .stat-label {
        font-size: 0.75rem;
        color: var(--mdc-theme-text-secondary-on-background, rgba(0, 0, 0, 0.54));
    }

    .stat-value {
        font-size: 1rem;
        font-weight: 600;
        color: var(--mdc-theme-primary);
    }
</style>
