import { AppState, saveState } from '../core/state';
import { addPress, clearHistory } from '../core/tracker';
import { INITIAL_DISPLAY_COUNT, resetDisplayedCount } from './renderer';
import { updateUI } from './renderer';
import { dom } from './dom';

export const handlePaceClick = (state: AppState): void => {
    if (!state.activeTrackerId) return;
    addPress(state.trackers[state.activeTrackerId], Date.now());
    saveState(state);
    updateUI();
};

export const handleClearHistory = (state: AppState): void => {
    if (!state.activeTrackerId) return;

    if (confirm('Are you sure you want to clear the history for this tracker? This action cannot be undone.')) {
        clearHistory(state.trackers[state.activeTrackerId]);
        resetDisplayedCount();
        saveState(state);
        updateUI();
    }
};

export const handleNewTracker = (state: AppState): AppState => {
    const name = prompt("Enter a name for the new tracker:", "New Pace");
    if (name) {
        const newId = `tracker-${Date.now()}`;
        state.trackers[newId] = { name, pressTimes: [] };
        state.activeTrackerId = newId;
        saveState(state);
        updateUI();
    }
    return state;
};

export const handleDeleteTracker = (state: AppState): AppState => {
    if (!state.activeTrackerId) return state;
    const trackerIds = Object.keys(state.trackers);
    if (trackerIds.length <= 1) {
        alert("You cannot delete the last tracker.");
        return state;
    }

    const currentTrackerName = state.trackers[state.activeTrackerId].name;
    if (confirm(`Are you sure you want to delete the "${currentTrackerName}" tracker?`)) {
        const currentIndex = trackerIds.indexOf(state.activeTrackerId);
        delete state.trackers[state.activeTrackerId];

        const newTrackerIds = Object.keys(state.trackers);
        state.activeTrackerId = newTrackerIds[currentIndex] || newTrackerIds[newTrackerIds.length - 1];

        saveState(state);
        updateUI();
    }
    return state;
};

export const switchTracker = (state: AppState, direction: 'next' | 'prev'): AppState => {
    if (!state.activeTrackerId) return state;
    const trackerIds = Object.keys(state.trackers);
    const currentIndex = trackerIds.indexOf(state.activeTrackerId);
    let nextIndex: number;

    if (direction === 'next') {
        nextIndex = (currentIndex + 1) % trackerIds.length;
    } else {
        nextIndex = (currentIndex - 1 + trackerIds.length) % trackerIds.length;
    }

    state.activeTrackerId = trackerIds[nextIndex];
    saveState(state);
    updateUI();
    return state;
};
