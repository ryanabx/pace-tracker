// DOM Elements
const trackerNameEl = document.getElementById('trackerName') as HTMLHeadingElement | null;
const paceButton = document.getElementById('paceButton') as HTMLButtonElement | null;
const averageTimeDiv = document.getElementById('averageTime') as HTMLDivElement | null;
const historyDiv = document.getElementById('history') as HTMLUListElement | null;
const showMoreButton = document.getElementById('showMoreButton') as HTMLButtonElement | null;
const showLessButton = document.getElementById('showLessButton') as HTMLButtonElement | null; 
const clearHistoryButton = document.getElementById('clearHistoryButton') as HTMLButtonElement | null;
const newTrackerButton = document.getElementById('newTrackerButton') as HTMLButtonElement | null;
const deleteTrackerButton = document.getElementById('deleteTrackerButton') as HTMLButtonElement | null;
const prevTrackerButton = document.getElementById('prevTrackerButton') as HTMLButtonElement | null;
const nextTrackerButton = document.getElementById('nextTrackerButton') as HTMLButtonElement | null;

// --- State Management ---

interface Tracker {
    name: string;
    pressTimes: number[];
}

interface AppState {
    trackers: Record<string, Tracker>;
    activeTrackerId: string | null;
}

let state: AppState;

// History display state
const INITIAL_DISPLAY_COUNT = 5;
const SHOW_MORE_INCREMENT = 10;
let displayedCount = INITIAL_DISPLAY_COUNT;

const saveState = (): void => {
    localStorage.setItem('paceTrackerState', JSON.stringify(state));
};

const loadState = (): void => {
    const savedState = localStorage.getItem('paceTrackerState');
    if (savedState) {
        state = JSON.parse(savedState);
    } else {
        // Default initial state
        const defaultId = `tracker-${Date.now()}`;
        state = {
            trackers: {
                [defaultId]: { name: 'My First Pace', pressTimes: [] }
            },
            activeTrackerId: defaultId
        };
    }
};

// --- UI Update Functions ---

const updateAverageTime = (): void => {
    if (!averageTimeDiv || !state.activeTrackerId) {
        console.error("Element with id 'averageTime' not found.");
        return;
    }

    const pressTimes = state.trackers[state.activeTrackerId].pressTimes;

    if (pressTimes.length < 2) {
        averageTimeDiv.textContent = 'Not enough data yet.';
        return;
    }

    let totalDifference = 0;
    for (let i = 1; i < pressTimes.length; i++) {
        totalDifference += pressTimes[i] - pressTimes[i - 1];
    }

    const averageDifference: number = totalDifference / (pressTimes.length - 1);

    const days = Math.floor(averageDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((averageDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((averageDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((averageDifference % (1000 * 60)) / 1000);

    averageTimeDiv.innerHTML = `
        <div>${days}d ${hours}h ${minutes}m ${seconds}s</div>
        <div style="font-size: 0.5em; margin-top: 10px;">on average</div>
    `;
};

const updateHistory = (): void => {
    if (!historyDiv || !showMoreButton || !showLessButton || !clearHistoryButton || !deleteTrackerButton || !state.activeTrackerId) {
        console.error("History elements not found.");
        return;
    }

    const pressTimes = state.trackers[state.activeTrackerId].pressTimes;
    const trackerIds = Object.keys(state.trackers);

    deleteTrackerButton.disabled = trackerIds.length <= 1;

    historyDiv.innerHTML = ''; // Clear existing list

    const reversedTimes = [...pressTimes].reverse();
    const timesToDisplay = reversedTimes.slice(0, displayedCount);

    if (timesToDisplay.length === 0) {
        historyDiv.innerHTML = '<li>No clicks recorded yet.</li>';
    } else {
        timesToDisplay.forEach(time => {
            const listItem = document.createElement('li');
            listItem.textContent = new Date(time).toLocaleString();
            historyDiv.appendChild(listItem);
        });
    }

    // Show or hide the "Show More" button based on available history
    if (reversedTimes.length > displayedCount) {
        showMoreButton.classList.remove('hidden');
    } else {
        showMoreButton.classList.add('hidden');
    }

    // Show or hide the "Clear History" button based on whether there's any data
    if (pressTimes.length > 0) {
        clearHistoryButton.classList.remove('hidden');
    } else {
        clearHistoryButton.classList.add('hidden');
    }

    // Show or hide the "Show Less" button based on current displayed count
    if (displayedCount > INITIAL_DISPLAY_COUNT) {
        showLessButton.classList.remove('hidden');
    } else {
        showLessButton.classList.add('hidden');
    }
};

const updateUI = (): void => {
    if (!state.activeTrackerId || !trackerNameEl) return;

    const activeTracker = state.trackers[state.activeTrackerId];
    trackerNameEl.textContent = activeTracker.name;

    displayedCount = INITIAL_DISPLAY_COUNT; // Reset history view on tracker switch
    updateAverageTime();
    updateHistory();
};

// --- Event Handler Functions ---

const handlePaceClick = () => {
    if (!state.activeTrackerId) return;
    state.trackers[state.activeTrackerId].pressTimes.push(Date.now());
    saveState();
    updateAverageTime();
    updateHistory();
};

const handleClearHistory = (): void => {
    if (!state.activeTrackerId) return;

    if (confirm('Are you sure you want to clear the history for this tracker? This action cannot be undone.')) {
        state.trackers[state.activeTrackerId].pressTimes = [];
        displayedCount = INITIAL_DISPLAY_COUNT; // Reset display count
        saveState();
        updateUI();
    }
};

const handleNewTracker = () => {
    const name = prompt("Enter a name for the new tracker:", "New Pace");
    if (name) {
        const newId = `tracker-${Date.now()}`;
        state.trackers[newId] = { name, pressTimes: [] };
        state.activeTrackerId = newId;
        saveState();
        updateUI();
    }
};

const handleDeleteTracker = () => {
    if (!state.activeTrackerId) return;
    const trackerIds = Object.keys(state.trackers);
    if (trackerIds.length <= 1) {
        alert("You cannot delete the last tracker.");
        return;
    }

    const currentTrackerName = state.trackers[state.activeTrackerId].name;
    if (confirm(`Are you sure you want to delete the "${currentTrackerName}" tracker?`)) {
        const currentIndex = trackerIds.indexOf(state.activeTrackerId);
        delete state.trackers[state.activeTrackerId];

        // Switch to the next available tracker
        const newTrackerIds = Object.keys(state.trackers);
        state.activeTrackerId = newTrackerIds[currentIndex] || newTrackerIds[newTrackerIds.length - 1];

        saveState();
        updateUI();
    }
};

const switchTracker = (direction: 'next' | 'prev') => {
    if (!state.activeTrackerId) return;
    const trackerIds = Object.keys(state.trackers);
    const currentIndex = trackerIds.indexOf(state.activeTrackerId);
    let nextIndex;

    if (direction === 'next') {
        nextIndex = (currentIndex + 1) % trackerIds.length;
    } else {
        nextIndex = (currentIndex - 1 + trackerIds.length) % trackerIds.length;
    }

    state.activeTrackerId = trackerIds[nextIndex];
    saveState();
    updateUI();
};

// --- Initialization ---

const initializeApp = () => {
    loadState();

    if (paceButton) {
        paceButton.addEventListener('click', handlePaceClick);
    }

    if (showMoreButton) {
        showMoreButton.addEventListener('click', () => {
            displayedCount += SHOW_MORE_INCREMENT;
            updateHistory();
        });
    }

    if (showLessButton) {
        showLessButton.addEventListener('click', () => {
            displayedCount = INITIAL_DISPLAY_COUNT;
            updateHistory();
        });
    }

    if (clearHistoryButton) {
        clearHistoryButton.addEventListener('click', handleClearHistory);
    }

    if (newTrackerButton) {
        newTrackerButton.addEventListener('click', handleNewTracker);
    }

    if (deleteTrackerButton) {
        deleteTrackerButton.addEventListener('click', handleDeleteTracker);
    }

    if (prevTrackerButton) {
        prevTrackerButton.addEventListener('click', () => switchTracker('prev'));
    }

    if (nextTrackerButton) {
        nextTrackerButton.addEventListener('click', () => switchTracker('next'));
    }

    updateUI();
};

initializeApp();