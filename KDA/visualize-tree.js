
function drawIntervalGraph(intervalGraphDiv, intervals) {
    console.debug('drawIntervals:', intervals);
    intervalGraphDiv.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.width = intervalGraphDiv.clientWidth;
    canvas.height = 200; // You can adjust this height as needed
    console.debug(canvas);
    intervalGraphDiv.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    const maxInterval = Math.max(...intervals) || 0;
    if (intervals.length !== 0) {
        const barWidth = width / intervals.length;
        ctx.fillStyle = 'blue';
        intervals.forEach((interval, index) => {
            const barHeight = (interval / maxInterval) * (height - 20); // Leave space for x-axis
            ctx.fillRect(index * barWidth, height - barHeight - 20, barWidth - 1, barHeight);
        });
    }

    // Draw x-axis
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(0, height - 20);
        ctx.lineTo(width, height - 20);
        ctx.stroke();

    // Draw y-axis
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, height - 20);
        ctx.stroke();

    // Add labels
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.fillText('0', 5, height - 5);
        ctx.fillText(maxInterval.toFixed(2) + 'ms', 5, 15);
        ctx.fillText('Keystrokes', width / 2, height - 5);
    
    // Rotate text for y-axis label
        ctx.save();
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Interval (ms)', -height / 2, 15);
        ctx.restore();
}

function visualizeTree(treeVisualizationDiv, decisionTree) {

    // Prune the tree to avoid overfitting
    decisionTree.prune();
    const dotContent = decisionTree.toDot();
    const viz = new Viz();
    viz.renderSVGElement(dotContent)
        .then(element => {
            treeVisualizationDiv.innerHTML = '';
            treeVisualizationDiv.appendChild(element);
            element.setAttribute('width', '100%');
            element.removeAttribute('height');
            // element.setAttribute('height', 'auto');
            element.style.maxHeight = '80vh';  // Limit maximum height
            element.style.overflow = 'auto';   // Add scrollbars if needed
            
            const dotBlob = new Blob([dotContent], { type: 'text/vnd.graphviz' });
            const dotUrl = URL.createObjectURL(dotBlob);
            const svgContent = new XMLSerializer().serializeToString(element);
            const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
            const downloadLinksContainer = document.createElement('div');
            downloadLinksContainer.className = 'download-links';
            const dotDownloadLink = document.createElement('a');
            dotDownloadLink.href = dotUrl;
            dotDownloadLink.download = 'decision_tree.dot';
            dotDownloadLink.textContent = 'Download DOT File';
            dotDownloadLink.className = 'button';
            const svgOpenLink = document.createElement('a');
            svgOpenLink.href = svgUrl;
            svgOpenLink.textContent = 'Open SVG';
            svgOpenLink.className = 'button';
            svgOpenLink.target = '_blank';
            svgOpenLink.rel = 'noopener noreferrer';
            downloadLinksContainer.appendChild(dotDownloadLink);
            downloadLinksContainer.appendChild(svgOpenLink);
            treeVisualizationDiv.appendChild(downloadLinksContainer);
            dotDownloadLink.onclick = () => setTimeout(() => URL.revokeObjectURL(dotUrl), 100);
            svgOpenLink.onclick = () => setTimeout(() => URL.revokeObjectURL(svgUrl), 100);
        })
        .catch(error => {
            console.error('Error rendering tree visualization:', error);
            treeVisualizationDiv.innerHTML = 'Error generating tree visualization. Please try again.';
        });
}


export { drawIntervalGraph, visualizeTree };

