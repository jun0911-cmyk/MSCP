let canvasBoxes = [];
let canvasCount = 0;
let lastCanvas = null;
let emptyCanvasDataURL;

const addComment = (canvasBoxObj) => {
    let canvas = document.createElement('canvas');
    canvas.id = "copyed";
    canvas.className = 'dynamic-canvas';
    canvas.width = 150;
    canvas.height = 60;

    canvas.style.left = `${canvasBoxObj.x}px`;
    canvas.style.top = `${canvasBoxObj.y}px`;

    let context = canvas.getContext('2d');
    let image = new Image();

    image.src = canvasBoxObj.data;

    image.onload = function() {
        context.drawImage(image, 0, 0);
    }

    document.getElementById("canvasContainer").appendChild(canvas);
}


const createInputBox = (event, socket, page, pdf_cover, container) => {
    const rect = pdf_cover.getBoundingClientRect();

    const x = (event.clientX - rect.left) - 5;
    const y = (event.clientY - rect.top) - 10;

    canvasCount += 1;

    let canvas = document.createElement('canvas');
    canvas.id = String(canvasCount);
    canvas.className = 'dynamic-canvas';
    canvas.width = 150;
    canvas.height = 60;

    canvas.style.left = `${x}px`;
    canvas.style.top = `${y}px`;
    
    let context = canvas.getContext('2d');
    document.getElementById("canvasContainer").appendChild(canvas);

    const canvasBoxObj = {
        element: canvas,
        id: canvas.id,
        x: x,
        y: y,
        offsetX: container.style.width,
        offsetY: container.style.height,
    }

    canvasBoxes.push(canvasBoxObj);
    
    if (!emptyCanvasDataURL) {
        emptyCanvasDataURL = canvas.toDataURL();
    }

    if (lastCanvas && lastCanvas.toDataURL() === emptyCanvasDataURL) {
        lastCanvas.remove();
        const index = canvasBoxes.findIndex((obj) => obj.id === lastCanvas.id);
        if (index !== -1) {
            canvasBoxes.splice(index, 1);
        }
    } else {
        if (canvasBoxes[canvasBoxes.length - 2] != undefined) {
            socket.emit("comment_canvas_send", canvasBoxes[canvasBoxes.length - 2], page);
        }
    }

    lastCanvas = canvas;

    var draw = false;
    
    canvas.addEventListener('mousedown', function(event) {
        draw = true;
        context.beginPath();
    });
    
    canvas.addEventListener('mousemove', function(event) {
        if (!draw) return;
        context.lineTo(event.offsetX, event.offsetY);
        context.stroke();
    });
    
    canvas.addEventListener('mouseup', function() {
        draw = false;
    });
    
    canvas.addEventListener('mouseout', function() {
        canvas.toBlob(function(blob) {
            let reader = new FileReader();

            reader.readAsArrayBuffer(blob);
            reader.onloadend = function() {
                let arrayBuffer = reader.result;
                let typedArray = new Uint8Array(arrayBuffer);
                let json = JSON.stringify(Array.from(typedArray));
                canvasBoxObj["data"] = canvas.toDataURL();
                canvasBoxObj["blob"] = json;
            }
        });

        draw = false;
    });
}

const getCommentObj = () => {
    return canvasBoxes;
}

const clearCommentObj = () => {
    canvasBoxes = [];
    canvasCount = 0;
    document.getElementById("canvasContainer").innerHTML = "";
}

const clearCommentObjSaveBtn = () => {
    inputBoxes = [];
    canvasCount = 0;

}

export default {
    createInputBox,
    clearCommentObjSaveBtn,
    getCommentObj,
    addComment,
    clearCommentObj,
};