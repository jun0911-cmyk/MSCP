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

const drawSign = (socket) => {
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
        lines = [];
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    async function saveLines() {
        document.getElementById("sign_content").innerHTML = `
        <p>계약 체결(서명) NFT 인증서를 발급중입니다... 시간이 소요될 수 있습니다, 잠시 대기해주세요.</p>
        `;

        const res = await sendSign({
            sign: JSON.stringify(lines)
        });

        if (res.status == 200 && res.message == "success sign") {
            socket.emit("contract_sign_success");
        } else {
            document.getElementById("sign_content").innerHTML = `
            <p>계약 체결(서명) NFT 인증서 발급 대기중입니다...</p>
            `;
        }
    }

    function setLineWidth(value) {
        lineWidth = value;
    }

    setLineWidth(3);
}

export default {
    drawSign,
}