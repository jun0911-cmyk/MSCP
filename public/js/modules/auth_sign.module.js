let lines = [];

const getSignData = () => {
    return lines;
}

const drawSign = () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let lineWidth = 1;
    
    document.getElementById("redraw").addEventListener("click", reDrawing);

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function draw(e) {
        if (!isDrawing) return;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
        lines.push({ x: e.offsetX, y: e.offsetY });
    }

    function stopDrawing() {
        isDrawing = false;
    }

    function reDrawing() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function setLineWidth(value) {
        lineWidth = value;
    }

    setLineWidth(3);
}

export default {
    drawSign,
    getSignData,
}
