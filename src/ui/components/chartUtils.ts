export interface ChartPoint {
    /** Short label for the x axis (e.g. "1/15", "Today"). */
    label: string;
    /** Long label for tooltips (e.g. "Tuesday, January 15"). */
    fullLabel: string;
    /** The plotted value: hit count, or milliseconds for time-between. */
    value: number;
    /** Whether the period actually contains data (false = gap/zero). */
    hasData: boolean;
}

export interface NiceScale {
    max: number;
    ticks: number[]; // top to bottom, ending at 0
}

/**
 * Round a raw maximum up to a "nice" number (1, 2 or 5 x 10^n) and return
 * evenly spaced axis ticks from that maximum down to zero.
 */
export const niceScale = (rawMax: number, tickCount = 4): NiceScale => {
    const raw = Math.max(rawMax, 1);
    const magnitude = 10 ** Math.floor(Math.log10(raw));
    const norm = raw / magnitude;
    const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
    const max = nice * magnitude;
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => max * (1 - i / tickCount));
    return { max, ticks };
};

/** Skip x-axis labels so they don't overlap, always keeping the last one. */
export const labelStepFor = (count: number): number => Math.max(1, Math.ceil(count / 7));
