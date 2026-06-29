import { loadState, saveState } from './core/state';
import { dom, initDom } from './ui/dom';
import { updateUI, getDisplayedCount, setDisplayedCount, INITIAL_DISPLAY_COUNT, SHOW_MORE_INCREMENT } from './ui/renderer';
import { handlePaceClick, handleClearHistory, handleNewTracker, handleDeleteTracker, switchTracker } from './ui/events';

let state = loadState();

const initializeApp = (): void => {
    initDom();
    if (!dom) return;

    dom.state = state;

    if (dom.paceButton) {
        dom.paceButton.addEventListener('click', () => handlePaceClick(state));
    }

    if (dom.showMoreButton) {
        dom.showMoreButton.addEventListener('click', () => {
            setDisplayedCount(getDisplayedCount() + SHOW_MORE_INCREMENT);
            updateUI();
        });
    }

    if (dom.showLessButton) {
        dom.showLessButton.addEventListener('click', () => {
            setDisplayedCount(INITIAL_DISPLAY_COUNT);
            updateUI();
        });
    }

    if (dom.clearHistoryButton) {
        dom.clearHistoryButton.addEventListener('click', () => handleClearHistory(state));
    }

    if (dom.newTrackerButton) {
        dom.newTrackerButton.addEventListener('click', () => handleNewTracker(state));
    }

    if (dom.deleteTrackerButton) {
        dom.deleteTrackerButton.addEventListener('click', () => handleDeleteTracker(state));
    }

    if (dom.prevTrackerButton) {
        dom.prevTrackerButton.addEventListener('click', () => switchTracker(state, 'prev'));
    }

    if (dom.nextTrackerButton) {
        dom.nextTrackerButton.addEventListener('click', () => switchTracker(state, 'next'));
    }

    setInterval(() => updateUI(), 1000);
    updateUI();
};

initializeApp();
