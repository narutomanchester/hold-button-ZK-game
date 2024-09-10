let holdButton = document.getElementById('holdButton');
let counter = document.getElementById('counter');
let intervalId = null;
let seconds = 0;

holdButton.addEventListener('mousedown', () => {
    intervalId = setInterval(() => {
        seconds++;
        counter.textContent = seconds;
    }, 1000);
});

holdButton.addEventListener('mouseup', () => {
    clearInterval(intervalId);
    // seconds = 0;
    counter.textContent = seconds;
});