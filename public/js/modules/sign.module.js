const sendSign = async (sign_data) => { 
    return await $.ajax({
        url: '/contract/sign',
        type: 'POST',
        data: JSON.stringify(sign_data),
        headers: {
            "Content-Type": "application/json"
        },
    });
}

const drawSign = () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lines = [];
    let lastX = 0;
    let lastY = 0;
    let lineWidth = 1;

    document.getElementById("save").addEventListener("click", saveLines);
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

    async function saveLines() {
        await sendSign({
            sign: JSON.stringify(lines)
        });
    }

    function setLineWidth(value) {
        lineWidth = value;
    }

    setLineWidth(3);
}

export default {
    drawSign,
}

/*

function loadLines() {
    const savedLines = JSON.parse(localStorage.getItem('lines'));
    if (savedLines && Array.isArray(savedLines)) {
        lines = savedLines;
        redrawLines();
}
}

function redrawLines() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    lines.forEach(function (line) {
        ctx.beginPath();
        ctx.lineWidth = 3; 
        ctx.moveTo(lines[0].x, lines[0].y);

        lines.forEach(function (point) {
            ctx.lineTo(point.x, point.y);
        });

        ctx.stroke();
    });
}
*/