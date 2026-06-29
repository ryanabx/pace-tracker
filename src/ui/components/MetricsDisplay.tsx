import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    SelectChangeEvent,
    Paper,
} from '@mui/material';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Cell,
} from 'recharts';
import { formatTime } from '../../core/tracker';

// ── Data helpers ──────────────────────────────────────────────────────────────

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

function getPeriodMs(period: 'day' | 'week' | 'month'): number {
    return period === 'day' ? MS_IN_DAY : period === 'week' ? MS_IN_WEEK : MS_IN_MONTH;
}

function formatDateKey(
    bucketStart: number,
    period: 'day' | 'week' | 'month',
    offset: number
): string {
    const start = new Date(bucketStart);
    if (offset === 0) return 'Today';
    if (offset === 1 && period === 'day') return 'Yesterday';

    if (period === 'day') {
        return `${start.getMonth() + 1}/${start.getDate()}`;
    }
    if (period === 'week') {
        return `W${start.getMonth() + 1}/${start.getDate()}`;
    }
    return `${start.toLocaleString('default', { month: 'short' })} ${start.getFullYear()}`;
}

function bucketPressTimes(
    pressTimes: number[],
    period: 'day' | 'week' | 'month',
    rangeCount: number,
    now: number,
    compute: 'hits' | 'timeBetween'
): ChartPoint[] {
    if (pressTimes.length === 0) return [];

    const periodMs = getPeriodMs(period);
    const buckets: Bucket[] = Array.from({ length: rangeCount }, () => ({ hits: 0, intervals: [] }));

    // Assign each press to a bucket by index
    for (const ts of pressTimes) {
        const offset = Math.floor((now - ts) / periodMs);
        if (offset >= 0 && offset < rangeCount) {
            buckets[offset].hits += 1;
        }
    }

    // Assign intervals to buckets (midpoint of each interval)
    for (let i = 1; i < pressTimes.length; i++) {
        const diff = pressTimes[i] - pressTimes[i - 1];
        const midTs = pressTimes[i] - diff / 2;

        const offset = Math.floor((now - midTs) / periodMs);
        if (offset >= 0 && offset < rangeCount) {
            buckets[offset].intervals.push(diff);
        }
    }

    // Build result array (index 0 = newest, reverse for chart display)
    const result: ChartPoint[] = [];
    for (let i = 0; i < rangeCount; i++) {
        const label = formatDateKey(now - periodMs * i, period, i);
        if (compute === 'hits') {
            result.push({ label, value: buckets[i].hits });
        } else {
            const avg = buckets[i].intervals.length > 0
                ? buckets[i].intervals.reduce((a, b) => a + b, 0) / buckets[i].intervals.length
                : 0;
            result.push({ label, value: avg, msValue: avg });
        }
    }

    // Reverse so newest is on the right
    return result.reverse();
}

// ── Constants ─────────────────────────────────────────────────────────────────

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

const BAR_COLORS = ['#1976d2', '#42a5f5', '#64b5f6', '#90caf9', '#bbdefb'];

// ── Custom Tooltip ────────────────────────────────────────────────────────────

interface TooltipPayload {
    value: number;
    payload: ChartPoint;
}

const CustomTooltip: React.FC<{ active?: boolean; payload?: TooltipPayload[] }> = ({
    active,
    payload,
}) => {
    if (active && payload && payload.length > 0) {
        const point = payload[0].payload;
        return (
            <Paper
                elevation={3}
                sx={{
                    p: 1.5,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                }}
            >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {point.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {point.value} hit{point.value !== 1 ? 's' : ''}
                </Typography>
            </Paper>
        );
    }
    return null;
};

const TimeBetweenTooltip: React.FC<{ active?: boolean; payload?: TooltipPayload[] }> = ({
    active,
    payload,
}) => {
    if (active && payload && payload.length > 0) {
        const point = payload[0].payload;
        return (
            <Paper
                elevation={3}
                sx={{
                    p: 1.5,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                }}
            >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {point.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Avg: {point.msValue != null ? formatTime(point.msValue) : 'N/A'}
                </Typography>
            </Paper>
        );
    }
    return null;
};

// ── Main Component ────────────────────────────────────────────────────────────

interface MetricsDisplayProps {
    pressTimes: number[];
    now: number;
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ pressTimes, now }) => {
    const [metricType, setMetricType] = useState<MetricType>('hits');
    const [period, setPeriod] = useState<PeriodGranularity>('day');

    const periodOption = PERIOD_OPTIONS.find(o => o.value === period)!;

    const data = useMemo(() => {
        return bucketPressTimes(pressTimes, period, periodOption.range, now, metricType);
    }, [pressTimes, period, periodOption.range, now, metricType]);

    const chartHeight = 300;

    const hasData = data.length > 0 && data.some(d => d.value > 0);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
            {/* Metric type tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={metricType}
                    onChange={(_, v) => setMetricType(v as MetricType)}
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 500,
                            minHeight: 48,
                        },
                    }}
                >
                    {METRIC_TYPES.map(t => (
                        <Tab key={t.value} value={t.value} label={t.label} />
                    ))}
                </Tabs>
            </Box>

            {/* Period selector */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Period</InputLabel>
                <Select
                    value={period}
                    label="Period"
                    onChange={(e: SelectChangeEvent<PeriodGranularity>) => setPeriod(e.target.value as PeriodGranularity)}
                    sx={{ bgcolor: 'background.paper' }}
                >
                    {PERIOD_OPTIONS.map(o => (
                        <MenuItem key={o.value} value={o.value}>
                            {o.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Chart */}
            <Box
                sx={{
                    width: '100%',
                    height: chartHeight,
                    minHeight: 200,
                }}
            >
                {pressTimes.length < 2 ? (
                    <Box
                        sx={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                            Record at least 2 pace hits to see metrics.
                        </Typography>
                    </Box>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 11 }}
                                interval="preserveStartEnd"
                                stroke="rgba(128,128,128,0.5)"
                            />
                            <YAxis
                                tick={{ fontSize: 11 }}
                                stroke="rgba(128,128,128,0.5)"
                                tickFormatter={(v: number) => {
                                    if (metricType === 'hits') return `${v}`;
                                    if (v >= 1000 * 60 * 60 * 24) return `${Math.round(v / (1000 * 60 * 60 * 24))}d`;
                                    if (v >= 1000 * 60 * 60) return `${Math.round(v / (1000 * 60 * 60))}h`;
                                    if (v >= 1000 * 60) return `${Math.round(v / (1000 * 60))}m`;
                                    return `${Math.round(v / 1000)}s`;
                                }}
                            />
                            {metricType === 'hits' ? (
                                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                            ) : (
                                <RechartsTooltip content={<TimeBetweenTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                            )}
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
                                {data.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={BAR_COLORS[index % BAR_COLORS.length]}
                                        style={{ cursor: 'pointer' }}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Box>

            {/* Summary row */}
            {hasData && (
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 2,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'action.selected',
                    }}
                >
                    {(() => {
                        const nonZero = data.filter(d => d.value > 0);
                        const total = nonZero.reduce((sum, d) => sum + d.value, 0);
                        const avg = nonZero.length > 0 ? total / nonZero.length : 0;

                        return (
                            <>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        {metricType === 'hits' ? 'Total hits' : 'Total intervals'}
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                        {metricType === 'hits' ? total : nonZero.length}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        {metricType === 'hits' ? 'Avg hits/period' : 'Avg time between'}
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                        {metricType === 'hits'
                                            ? avg.toFixed(1)
                                            : formatTime(avg)}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Periods with data
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                        {nonZero.length} / {data.length}
                                    </Typography>
                                </Box>
                            </>
                        );
                    })()}
                </Box>
            )}
        </Box>
    );
};

export default MetricsDisplay;
