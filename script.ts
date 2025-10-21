const paceButton = document.getElementById('paceButton') as HTMLButtonElement | null;
const averageTimeDiv = document.getElementById('averageTime') as HTMLDivElement | null;

let pressTimes: number[] = JSON.parse(localStorage.getItem('pressTimes') || '[]') || [];

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

if (paceButton) {
    paceButton.addEventListener('click', () => {
        pressTimes.push(Date.now());
        localStorage.setItem('pressTimes', JSON.stringify(pressTimes));
        calculateAverageTime();
    });
}

// Initial calculation on page load
calculateAverageTime();