export interface Tracker {
    name: string;
    pressTimes: number[];
}

export interface AppState {
    trackers: Record<string, Tracker>;
    activeTrackerId: string | null;
}

const STORAGE_KEY = 'paceTrackerState';

export const loadState = (): AppState => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
        return JSON.parse(savedState);
    }

    // Default initial state
    const defaultId = `tracker-${Date.now()}`;
    return {
        trackers: {
            [defaultId]: { name: 'My First Pace', pressTimes: [] }
        },
        activeTrackerId: defaultId
    };
};

export const saveState = (state: AppState): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
