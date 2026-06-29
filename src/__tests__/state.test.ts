import { describe, it, expect, beforeEach } from 'vitest';
import { loadState, saveState } from '../core/state';

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
        expect(state.trackers[state.activeTrackerId!].name).toBe('My First Pace');
        expect(state.trackers[state.activeTrackerId!].pressTimes).toEqual([]);
    });

    it('loads saved state from localStorage', () => {
        const savedState = {
            trackers: {
                'tracker-1': { name: 'Test Tracker', pressTimes: [1000, 2000, 3000] }
            },
            activeTrackerId: 'tracker-1'
        };
        localStorage.setItem('paceTrackerState', JSON.stringify(savedState));

        const state = loadState();

        expect(state).toEqual(savedState);
        expect(state.trackers['tracker-1'].name).toBe('Test Tracker');
        expect(state.trackers['tracker-1'].pressTimes).toEqual([1000, 2000, 3000]);
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
            activeTrackerId: 'tracker-1'
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
            activeTrackerId: 'tracker-1'
        };

        saveState(originalState);
        const loadedState = loadState();

        expect(loadedState).toEqual(originalState);
    });
});
