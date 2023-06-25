let checkKey = "";
let beforeKeyboard = "";
let shift = 0;
const keyboard_html = `
<style>
.keyboard {
    display: flex;
    flex-wrap: wrap;
    max-width: 650px;
    margin: 0 auto;
}

.key {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border: 1px solid #ccc;
    margin: 2px;
    cursor: pointer;
    user-select: none;
}

.key.delete {
    width: 70px;;
}

.key.tab {
    width: 70px;
}

.key.capslock {
    width: 90px;
}

.key.enter {
    width: 65px;
}

.key.shift {
    width: 100px;
}

.key.space {
    width: 204px;
}

.key:hover {
    animation-name: keyboard_animation;
    animation-duration: 1s;
    animation-fill-mode: forwards;
}

@keyframes keyboard_animation {
    20% {
        background-color: aqua;
        color: rgb(40, 33, 33);
    }
    50% {
        background-color: aqua;
        color: rgb(40, 33, 33);
    }
    100% {
        background-color: aqua;
        color: rgb(40, 33, 33);
    }
}
</style>
<div class="keyboard">
    <div class="key">~</div>
    <div class="key">1</div>
    <div class="key">2</div>
    <div class="key">3</div>
    <div class="key">4</div>
    <div class="key">5</div>
    <div class="key">6</div>
    <div class="key">7</div>
    <div class="key">8</div>
    <div class="key">9</div>
    <div class="key">0</div>
    <div class="key">-</div>
    <div class="key">+</div>
    <div class="key delete">Delete</div>
    <div class="key tab">Tab</div>
    <div class="key">Q</div>
    <div class="key">W</div>
    <div class="key">E</div>
    <div class="key">R</div>
    <div class="key">T</div>
    <div class="key">Y</div>
    <div class="key">U</div>
    <div class="key">I</div>
    <div class="key">O</div>
    <div class="key">P</div>
    <div class="key">[</div>
    <div class="key">]</div>
    <div class="key">\\</div>
    <div class="key capslock" id="mode">UpperMod</div>
    <div class="key">A</div>
    <div class="key">S</div>
    <div class="key">D</div>
    <div class="key">F</div>
    <div class="key">G</div>
    <div class="key">H</div>
    <div class="key">J</div>
    <div class="key">K</div>
    <div class="key">L</div>
    <div class="key">:</div>
    <div class="key">'</div>
    <div class="key enter">Enter</div>
    <div class="key shift">Shift</div>
    <div class="key">Z</div>
    <div class="key">X</div>
    <div class="key">C</div>
    <div class="key">V</div>
    <div class="key">B</div>
    <div class="key">N</div>
    <div class="key">M</div>
    <div class="key">,</div>
    <div class="key">.</div>
    <div class="key">?</div>
    <div class="key shift">Shift</div>
    <div class="key">!</div>
    <div class="key">@</div>
    <div class="key">#</div>
    <div class="key">$</div>
    <div class="key space">Space</div>
    <div class="key">%</div>
    <div class="key">^</div>
    <div class="key">&</div>
    <div class="key">*</div>
    <div class="key">(</div>
    <div class="key">)</div>
</div>
`;

const etcKeyConvert = (key, inputElement, keyboardElement) => {
    checkKey = key;

    if (key == "Tab") {
        return "    ";
    } else if (key == "Delete") {
        const element = inputElement;
        element.value = element.value.substr(0, element.value.length - 1);
        return null;
    } else if (key == "Space") {
        return " ";
    } else if (key == "Enter") {
        keyboardElement.innerHTML = "";
        return null;
    } else if (key == "Shift") {
        shift += 1;

        if (shift % 2 == 0) {
            document.getElementById("mode").innerText = "UpperMod";
        } else {
            document.getElementById("mode").innerText = "LowerMod";
        }

        return null;
    } else if (key == "UpperMod" || key == "LowerMod") {
        return null;
    }

    return shift % 2 == 0 ? key.toUpperCase() : key.toLowerCase();
}

$(".form-control").click(function(event) {
    if (checkKey != "Enter" || checkKey == "") {
        if (beforeKeyboard) {
            beforeKeyboard.innerHTML = "";
        }

        if (checkKey != "") {
            beforeKeyboard.innerHTML = "";
            checkKey = "Enter";
            shift = 0;
        }
    }

    const element = document.getElementById("keyboard." + event.target.id);
    const inputElement = document.getElementById(event.target.id);

    element.innerHTML = keyboard_html;
    beforeKeyboard = element;

    $(".key").click(function(event) {
        const keyboard_key = event.target.innerText;
        const key = etcKeyConvert(keyboard_key, inputElement, element);

        if (key == null) {
            return "delete";
        }
        
        inputElement.value += key;
    });
});