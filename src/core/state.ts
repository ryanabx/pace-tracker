export interface Tracker {
    name: string;
    pressTimes: number[];
}

export type ThemeMode = 'auto' | 'light' | 'dark';

export interface AppState {
    trackers: Record<string, Tracker>;
    activeTrackerId: string | null;
    themeMode: ThemeMode;
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
        activeTrackerId: defaultId,
        themeMode: 'auto' as ThemeMode,
    };
};

export const saveState = (state: AppState): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
