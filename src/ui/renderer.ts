import { AppState } from '../core/state';
import { formatTime, calculateAverage, getTimeSinceLastClick } from '../core/tracker';
import { dom } from './dom';

export const INITIAL_DISPLAY_COUNT = 5;
export const SHOW_MORE_INCREMENT = 10;
let _displayedCount = INITIAL_DISPLAY_COUNT;

export const getDisplayedCount = (): number => _displayedCount;

export const setDisplayedCount = (count: number): void => {
    _displayedCount = count;
};

export const resetDisplayedCount = (): void => {
    _displayedCount = INITIAL_DISPLAY_COUNT;
};

const updateAverageTime = (): void => {
    if (!dom?.averageTimeDiv || !dom.state?.activeTrackerId) {
        dom?.averageTimeDiv && (dom.averageTimeDiv.textContent = 'Not enough data yet.');
        return;
    }

    const pressTimes = dom.state.trackers[dom.state.activeTrackerId].pressTimes;

    if (pressTimes.length < 2) {
        dom.averageTimeDiv.textContent = 'Not enough data yet.';
        return;
    }

    const averageDifference = calculateAverage(pressTimes);

    dom.averageTimeDiv.innerHTML = `
        <div>Overall: ${formatTime(averageDifference)}</div>
        <div style="font-size: 0.5em; margin-top: 10px;">on average</div>
    `;
};

const updateAverageTimeLastTenEntries = (): void => {
    if (!dom?.averageTimeLastTenDiv || !dom.state?.activeTrackerId) {
        dom?.averageTimeLastTenDiv && (dom.averageTimeLastTenDiv.textContent = 'Not enough data yet.');
        return;
    }

    const pressTimes = dom.state.trackers[dom.state.activeTrackerId].pressTimes.slice(-10);

    if (pressTimes.length < 2) {
        dom.averageTimeLastTenDiv.textContent = 'Not enough data yet.';
        return;
    }

    const averageDifference = calculateAverage(pressTimes);

    dom.averageTimeLastTenDiv.innerHTML = `
        <div>Last 10: ${formatTime(averageDifference)}</div>
        <div style="font-size: 0.5em; margin-top: 10px;">on average</div>
    `;
};

const updateTimeSinceLastClick = (): void => {
    if (!dom?.timeSinceLastClickDiv || !dom.state?.activeTrackerId) {
        return;
    }

    const pressTimes = dom.state.trackers[dom.state.activeTrackerId].pressTimes;
    const difference = getTimeSinceLastClick(pressTimes);

    if (difference < 0) {
        dom.timeSinceLastClickDiv.textContent = 'No clicks yet.';
        return;
    }

    dom.timeSinceLastClickDiv.innerHTML = `
        <div>Since last: ${formatTime(difference)}</div>
    `;
};

const updateHistory = (): void => {
    if (!dom?.historyDiv || !dom.showMoreButton || !dom.showLessButton || !dom.clearHistoryButton || !dom.deleteTrackerButton || !dom.state?.activeTrackerId) {
        console.error("History elements not found.");
        return;
    }

    const pressTimes = dom.state.trackers[dom.state.activeTrackerId].pressTimes;
    const trackerIds = Object.keys(dom.state.trackers);

    dom.deleteTrackerButton.disabled = trackerIds.length <= 1;

    dom.historyDiv.innerHTML = '';

    const reversedTimes = [...pressTimes].reverse();
    const timesToDisplay = reversedTimes.slice(0, _displayedCount);

    if (timesToDisplay.length === 0) {
        dom.historyDiv.innerHTML = '<li>No clicks recorded yet.</li>';
    } else {
        timesToDisplay.forEach(time => {
            const listItem = document.createElement('li');
            listItem.textContent = new Date(time).toLocaleString();
            dom.historyDiv.appendChild(listItem);
        });
    }

    if (reversedTimes.length > _displayedCount) {
        dom.showMoreButton.classList.remove('hidden');
    } else {
        dom.showMoreButton.classList.add('hidden');
    }

    if (pressTimes.length > 0) {
        dom.clearHistoryButton.classList.remove('hidden');
    } else {
        dom.clearHistoryButton.classList.add('hidden');
    }

    if (_displayedCount > INITIAL_DISPLAY_COUNT) {
        dom.showLessButton.classList.remove('hidden');
    } else {
        dom.showLessButton.classList.add('hidden');
    }
};

export const updateUI = (): void => {
    if (!dom?.trackerNameEl || !dom.state) return;

    const activeTracker = dom.state.trackers[dom.state.activeTrackerId!];
    dom.trackerNameEl.textContent = activeTracker.name;

    _displayedCount = INITIAL_DISPLAY_COUNT;
    updateAverageTime();
    updateAverageTimeLastTenEntries();
    updateHistory();
    updateTimeSinceLastClick();
};
