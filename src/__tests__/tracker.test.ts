import { describe, it, expect } from 'vitest';
import { formatTime, calculateAverage, getTimeSinceLastClick, addPress, clearHistory } from '../core/tracker';
import type { Tracker } from '../core/state';

describe('formatTime', () => {
    it('formats zero milliseconds', () => {
        expect(formatTime(0)).toBe('0d 0h 0m 0s');
    });

    it('formats seconds correctly', () => {
        expect(formatTime(5000)).toBe('0d 0h 0m 5s');
    });

    it('formats minutes and seconds correctly', () => {
        expect(formatTime(90000)).toBe('0d 0h 1m 30s');
    });

    it('formats hours correctly', () => {
        expect(formatTime(3600000)).toBe('0d 1h 0m 0s');
    });

    it('formats days correctly', () => {
        expect(formatTime(86400000)).toBe('1d 0h 0m 0s');
    });

    it('formats complex durations correctly', () => {
        expect(formatTime(90061000)).toBe('1d 1h 1m 1s');
    });

    it('handles large durations', () => {
        expect(formatTime(2592000000)).toBe('30d 0h 0m 0s');
    });
});

describe('calculateAverage', () => {
    it('returns 0 for empty array', () => {
        expect(calculateAverage([])).toBe(0);
    });

    it('returns 0 for single element', () => {
        expect(calculateAverage([1000])).toBe(0);
    });

    it('calculates correct average for two times', () => {
        expect(calculateAverage([1000, 3000])).toBe(2000);
    });

    it('calculates correct average for multiple times', () => {
        const times = [1000, 2000, 4000, 7000];
        // Differences: 1000, 2000, 3000 => total 6000, count 3 => avg 2000
        expect(calculateAverage(times)).toBe(2000);
    });

    it('handles evenly spaced times', () => {
        const times = [0, 1000, 2000, 3000, 4000];
        expect(calculateAverage(times)).toBe(1000);
    });

    it('handles irregularly spaced times', () => {
        const times = [0, 500, 1500, 3000];
        // Differences: 500, 1000, 1500 => total 3000, count 3 => avg 1000
        expect(calculateAverage(times)).toBe(1000);
    });
});

describe('getTimeSinceLastClick', () => {
    it('returns -1 for empty array', () => {
        expect(getTimeSinceLastClick([])).toBe(-1);
    });

    it('returns correct time difference for non-empty array', () => {
        const fixedNow = 10000;
        const originalNow = Date.now;
        // @ts-ignore - mocking for test
        Date.now = () => fixedNow;

        const result = getTimeSinceLastClick([5000]);
        expect(result).toBe(5000);

        // @ts-ignore - restore
        Date.now = originalNow;
    });
});

describe('addPress', () => {
    it('adds a timestamp to the tracker', () => {
        const tracker: Tracker = { name: 'Test', pressTimes: [] };
        const timestamp = 12345;
        addPress(tracker, timestamp);
        expect(tracker.pressTimes).toEqual([timestamp]);
    });

    it('appends multiple timestamps', () => {
        const tracker: Tracker = { name: 'Test', pressTimes: [] };
        addPress(tracker, 100);
        addPress(tracker, 200);
        addPress(tracker, 300);
        expect(tracker.pressTimes).toEqual([100, 200, 300]);
    });
});

describe('clearHistory', () => {
    it('clears all press times', () => {
        const tracker: Tracker = { name: 'Test', pressTimes: [100, 200, 300] };
        clearHistory(tracker);
        expect(tracker.pressTimes).toEqual([]);
    });

    it('works on already empty tracker', () => {
        const tracker: Tracker = { name: 'Test', pressTimes: [] };
        clearHistory(tracker);
        expect(tracker.pressTimes).toEqual([]);
    });
});
