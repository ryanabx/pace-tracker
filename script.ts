const paceButton = document.getElementById('paceButton') as HTMLButtonElement | null;
const averageTimeDiv = document.getElementById('averageTime') as HTMLDivElement | null;
const historyDiv = document.getElementById('history') as HTMLUListElement | null;
const showMoreButton = document.getElementById('showMoreButton') as HTMLButtonElement | null;
const showLessButton = document.getElementById('showLessButton') as HTMLButtonElement | null;

let pressTimes: number[] = JSON.parse(localStorage.getItem('pressTimes') || '[]') || [];

const INITIAL_DISPLAY_COUNT = 5;
const SHOW_MORE_INCREMENT = 10;
let displayedCount = INITIAL_DISPLAY_COUNT;


const calculateAverageTime = (): void => {
    if (!averageTimeDiv) {
        console.error("Element with id 'averageTime' not found.");
        return;
    }

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

const renderHistory = (): void => {
    if (!historyDiv || !showMoreButton || !showLessButton) {
        console.error("History elements not found.");
        return;
    }

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

    // Show or hide the "Show Less" button based on current displayed count
    if (displayedCount > INITIAL_DISPLAY_COUNT) {
        showLessButton.classList.remove('hidden');
    } else {
        showLessButton.classList.add('hidden');
    }
};

if (paceButton) {
    paceButton.addEventListener('click', () => {
        pressTimes.push(Date.now());
        localStorage.setItem('pressTimes', JSON.stringify(pressTimes));
        calculateAverageTime();
        renderHistory();
    });
}

if (showMoreButton) {
    showMoreButton.addEventListener('click', () => {
        displayedCount += SHOW_MORE_INCREMENT;
        renderHistory();
    });
}

if (showLessButton) {
    showLessButton.addEventListener('click', () => {
        displayedCount = INITIAL_DISPLAY_COUNT; // Reset to initial display count
        renderHistory();
    });
}

// Initial calculation and render on page load
calculateAverageTime();
renderHistory();