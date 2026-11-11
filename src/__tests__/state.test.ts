import { describe, it, expect, beforeEach } from 'vitest';
import { loadState, saveState, nextTrackerName } from '../core/state';
import type { Tracker } from '../core/state';

describe('loadState', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('returns default state when no saved state exists', () => {
        const state = loadState();

        expect(state).toHaveProperty('trackers');
        expect(state).toHaveProperty('activeTrackerId');
        expect(Object.keys(state.trackers)).toHaveLength(1);
        expect(state.activeTrackerId).toBeTruthy();
        expect(state.trackers[state.activeTrackerId!].name).toBe('Tracker 1');
        expect(state.trackers[state.activeTrackerId!].pressTimes).toEqual([]);
    });

    it('loads saved state from localStorage', () => {
        const savedState = {
            trackers: {
                'tracker-1': { name: 'Test Tracker', pressTimes: [1000, 2000, 3000] }
            },
            activeTrackerId: 'tracker-1',
            themeMode: 'auto' as const,
        };
        localStorage.setItem('paceTrackerState', JSON.stringify(savedState));

        const state = loadState();

        expect(state).toEqual(savedState);
        expect(state.trackers['tracker-1'].name).toBe('Test Tracker');
        expect(state.trackers['tracker-1'].pressTimes).toEqual([1000, 2000, 3000]);
    });
});

describe('nextTrackerName', () => {
    const tracker = (name: string): Tracker => ({ name, pressTimes: [] });

    it('returns Tracker 1 when no trackers exist', () => {
        expect(nextTrackerName({})).toBe('Tracker 1');
    });

    it('returns Tracker N+1 for N trackers', () => {
        expect(
            nextTrackerName({
                't1': tracker('Tracker 1'),
                't2': tracker('Tracker 2'),
                't3': tracker('Tracker 3'),
            })
        ).toBe('Tracker 4');
    });

    it('skips names that collide with existing trackers', () => {
        // 2 trackers, so the sequence starts at Tracker 3 — which collides.
        expect(
            nextTrackerName({
                't1': tracker('Tracker 1'),
                't2': tracker('Tracker 3'),
            })
        ).toBe('Tracker 4');
    });

    it('does not collide with custom names', () => {
        expect(nextTrackerName({ 't1': tracker('Laps'), 't2': tracker('Coffee') })).toBe(
            'Tracker 3'
        );
    });

    it('starts from the tracker count, not from the highest numbered tracker', () => {
        expect(
            nextTrackerName({
                't1': tracker('Tracker 1'),
                't2': tracker('Tracker 10'),
            })
        ).toBe('Tracker 3');
    });
});

describe('saveState', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('saves state to localStorage', () => {
        const state = {
            trackers: {
                'tracker-1': { name: 'Test Tracker', pressTimes: [1000, 2000] }
            },
            activeTrackerId: 'tracker-1',
            themeMode: 'auto' as const,
        };

        saveState(state);

        const saved = localStorage.getItem('paceTrackerState');
        expect(saved).toBe(JSON.stringify(state));
    });

    it('persists state across save/load cycle', () => {
        const originalState = {
            trackers: {
                'tracker-1': { name: 'Persisted Tracker', pressTimes: [5000, 10000] }
            },
            activeTrackerId: 'tracker-1',
            themeMode: 'auto' as const,
        };

        saveState(originalState);
        const loadedState = loadState();

        expect(loadedState).toEqual(originalState);
    });
});
