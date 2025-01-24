
document.addEventListener('DOMContentLoaded', () => {
styleGauge(); // doesn't load !
});

function styleGauge() {
   const styles = document.createElement('style');
   styles.textContent = `
    .gauge-container {
    width: 100%;
    height: 1rem;
    background-color: #f0f0f0;
    margin: 5px 0;
    border-radius: 5px;
    /* overflow: hidden; */
    position: relative;
}

.gauge-bar {
    height: 100%;
    width: 0%;
    transition: width 0.5s ease-in-out;
    position: relative;
}

.gauge-label {
    position: absolute;
    top: 0;
    line-height: 20px;
    color: black;
    font-size: 12px;
    font-weight: bold;
    white-space: nowrap;
}`;
 document.head.appendChild(styles);
    console.log(styles);
    
}

export function updateGauge(divElem,guesses) {
    const gaugeBar = divElem.querySelector('.gauge-bar');
    const gaugeLabel = divElem.querySelector('.gauge-label');
    const log10Guesses = Math.log10(guesses);
    const percentage = Math.min(log10Guesses / 60 * 100, 100); // Assuming 10^60 as maximum
    gaugeLabel.title = `Guesses: ${guesses}`;

    gaugeBar.style.width = `${percentage}%`;
    gaugeBar.style.height = '100%';
    gaugeBar.style.backgroundImage = getGradient(percentage);
    gaugeLabel.textContent = `${(log10Guesses/6).toFixed(1)}`;
    updateLabelPosition(gaugeLabel, percentage);
    //console.debug({gaugeBar,gaugeLabel,percentage});
}

function updateLabelPosition(label, percentage) {
    if (percentage < 50) {
        label.style.left = `${percentage}%`;
        label.style.right = 'auto';
        label.style.textAlign = 'left';
        label.style.marginLeft = '5px';
    } else {
        label.style.left = 'auto';
        label.style.right = `${100 - percentage}%`;
        label.style.textAlign = 'right';
        label.style.marginRight = '5px';
    }
}

function getGradient(percentage) {
    const startColor = getColorForPercentage(0);
    const endColor = getColorForPercentage(percentage / 100);
    
    if (percentage <= 50) {
        return `linear-gradient(to right, ${startColor}, ${endColor})`;
    } else {
        const midColor = getColorForPercentage(0.5);
        const midPoint = (50 / percentage) * 100;
        return `linear-gradient(to right, ${startColor}, ${midColor} ${midPoint}%, ${endColor})`;
    }
}

function getColorForPercentage(value) {
    const hue = value * 120; // 0 to 120 (red to green)
    return `hsl(${hue}, 100%, 50%)`;
}

