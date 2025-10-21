const paceButton = document.getElementById('paceButton');
const averageTimeDiv = document.getElementById('averageTime');

let pressTimes = JSON.parse(localStorage.getItem('pressTimes')) || [];

const calculateAverageTime = () => {
    if (pressTimes.length < 2) {
        averageTimeDiv.textContent = 'Not enough data yet.';
        return;
    }

    let totalDifference = 0;
    for (let i = 1; i < pressTimes.length; i++) {
        totalDifference += pressTimes[i] - pressTimes[i - 1];
    }

    const averageDifference = totalDifference / (pressTimes.length - 1);

    const days = Math.floor(averageDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((averageDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((averageDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((averageDifference % (1000 * 60)) / 1000);

    averageTimeDiv.innerHTML = `
        <div>${days}d ${hours}h ${minutes}m ${seconds}s</div>
        <div style="font-size: 0.5em; margin-top: 10px;">on average</div>
    `;
};

paceButton.addEventListener('click', () => {
    pressTimes.push(Date.now());
    localStorage.setItem('pressTimes', JSON.stringify(pressTimes));
    calculateAverageTime();
});

// Initial calculation on page load
calculateAverageTime();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
