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
            [defaultId]: { name: 'Tracker 1', pressTimes: [] }
        },
        activeTrackerId: defaultId,
        themeMode: 'auto' as ThemeMode,
    };
};

/**
 * Compute the next auto-generated tracker name: "Tracker N+1", where N is
 * the number of existing trackers, incremented until the name no longer
 * collides with an existing tracker name.
 */
export const nextTrackerName = (trackers: Record<string, Tracker>): string => {
    const names = new Set(Object.values(trackers).map((t) => t.name));
    let n = Object.keys(trackers).length + 1;
    while (names.has(`Tracker ${n}`)) {
        n += 1;
    }
    return `Tracker ${n}`;
};

export const saveState = (state: AppState): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
