const inputContainer = document.getElementById('inputContainer');

let inputBoxes = [];

const addComment = (inputBoxObj) => {
    const target = document.getElementById('inputContainer');
    
    target.innerHTML += `
    <input type="text" class="input-box" style="left: ${String(inputBoxObj.x)}px; top: ${String(inputBoxObj.y)}px; width: ${inputBoxObj.inputSize}ch;" value="${inputBoxObj.text}" disabled>
    `;
}


const createInputBox = (event, socket, page, pdf_cover, container) => {
    const rect = pdf_cover.getBoundingClientRect();

    const x = (event.clientX - rect.left) - 5;
    const y = (event.clientY - rect.top) - 10;

    const inputBox = document.createElement('input');
    inputBox.type = 'text';
    inputBox.className = 'input-box';

    inputBox.style.left = `${x}px`;
    inputBox.style.top = `${y}px`;

    inputBox.addEventListener('click', function (event) {
        event.stopPropagation();
    });

    inputContainer.appendChild(inputBox);

    inputBox.focus();

    const inputBoxObj = {
        element: inputBox,
        text: '',
        x: x,
        y: y,
        clientX: event.clientX - 5,
        clientY: event.clientY - 10,
        offsetX: container.style.width,
        offsetY: container.style.height,
    };

    inputBoxes.push(inputBoxObj);

    inputBox.addEventListener('blur', function () {
        if (inputBox.value.trim() === '') {
            inputContainer.removeChild(inputBox);
            const index = inputBoxes.findIndex((obj) => obj.element === inputBox);
            if (index !== -1) {
                inputBoxes.splice(index, 1);
            }
        }

        socket.emit("comment_send", inputBoxObj, page);
    });

    function resizeInputBox() {
        inputBox.style.width = inputBox.value.length + 10 + 'ch';
        inputBoxObj.inputSize = inputBox.value.length + 2;
    }
  
    inputBox.addEventListener('input', resizeInputBox);
    resizeInputBox();
}

const saveInputBox = (event) => {
    const inputBox = event.target;
    const inputBoxObj = inputBoxes.find((obj) => obj.element === inputBox);

    if (inputBoxObj) {
        inputBoxObj.text = inputBox.value;
    }
}

const moveSetInputBox = (event) => {
    inputBoxes.forEach((inputBoxObj) => {
        if (inputBoxObj.element !== document.activeElement) {
            inputBoxObj.element.value = inputBoxObj.text;
        }
    });
}

const getCommentObj = () => {
    return inputBoxes;
}

const clearCommentObj = () => {
    inputBoxes = [];
    inputContainer.innerHTML = "";
}

const clearCommentObjSaveBtn = () => {
    inputBoxes = [];
}

export default {
    createInputBox,
    saveInputBox,
    moveSetInputBox,
    getCommentObj,
    addComment,
    clearCommentObj,
    clearCommentObjSaveBtn,
};