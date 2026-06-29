import { Tracker } from './state';

export const formatTime = (milliseconds: number): string => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

export const calculateAverage = (pressTimes: number[]): number => {
    if (pressTimes.length < 2) {
        return 0;
    }

    let totalDifference = 0;
    for (let i = 1; i < pressTimes.length; i++) {
        totalDifference += pressTimes[i] - pressTimes[i - 1];
    }

    return totalDifference / (pressTimes.length - 1);
};

export const getTimeSinceLastClick = (pressTimes: number[]): number => {
    const lastPressTime = pressTimes[pressTimes.length - 1];
    if (!lastPressTime) {
        return -1;
    }
    return Date.now() - lastPressTime;
};

export const addPress = (tracker: Tracker, timestamp: number): void => {
    tracker.pressTimes.push(timestamp);
};

export const clearHistory = (tracker: Tracker): void => {
    tracker.pressTimes = [];
};
