import { AppState } from '../core/state';

export let dom: {
    trackerNameEl: HTMLHeadingElement | null;
    paceButton: HTMLButtonElement | null;
    averageTimeDiv: HTMLDivElement | null;
    averageTimeLastTenDiv: HTMLDivElement | null;
    timeSinceLastClickDiv: HTMLDivElement | null;
    historyDiv: HTMLUListElement | null;
    showMoreButton: HTMLButtonElement | null;
    showLessButton: HTMLButtonElement | null;
    clearHistoryButton: HTMLButtonElement | null;
    newTrackerButton: HTMLButtonElement | null;
    deleteTrackerButton: HTMLButtonElement | null;
    prevTrackerButton: HTMLButtonElement | null;
    nextTrackerButton: HTMLButtonElement | null;
    state: AppState | null;
} | null = null;

export const initDom = (): typeof dom => {
    dom = {
        trackerNameEl: document.getElementById('trackerName') as HTMLHeadingElement | null,
        paceButton: document.getElementById('paceButton') as HTMLButtonElement | null,
        averageTimeDiv: document.getElementById('averageTime') as HTMLDivElement | null,
        averageTimeLastTenDiv: document.getElementById('averageTimeLastTen') as HTMLDivElement | null,
        timeSinceLastClickDiv: document.getElementById('timeSinceLastClick') as HTMLDivElement | null,
        historyDiv: document.getElementById('history') as HTMLUListElement | null,
        showMoreButton: document.getElementById('showMoreButton') as HTMLButtonElement | null,
        showLessButton: document.getElementById('showLessButton') as HTMLButtonElement | null,
        clearHistoryButton: document.getElementById('clearHistoryButton') as HTMLButtonElement | null,
        newTrackerButton: document.getElementById('newTrackerButton') as HTMLButtonElement | null,
        deleteTrackerButton: document.getElementById('deleteTrackerButton') as HTMLButtonElement | null,
        prevTrackerButton: document.getElementById('prevTrackerButton') as HTMLButtonElement | null,
        nextTrackerButton: document.getElementById('nextTrackerButton') as HTMLButtonElement | null,
        state: null,
    };
    return dom;
};
