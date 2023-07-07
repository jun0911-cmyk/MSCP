import fileHandle from "./modules/file.module.js";
import signHandle from "./modules/sign.module.js";

const return_btn = document.getElementById("return_btn");
const next_btn = document.getElementById("next_btn");
const sign_btn = document.getElementById("sign_contract_btn");
const chat_btn = document.getElementById("send_chat_btn");
const chat_form = document.getElementById("chat-form");
const socket = io("http://localhost:9000", { transports : ['websocket'], path: "/socket.io" });

let page = 1;

$("#return_btn").hide();
$("#next_btn").hide();

socket.emit("join_room", document.cookie, location.pathname.split("/")[3]);

/*
cert_verify_btn.addEventListener("click", async () => {
    const file = document.getElementById("inputGroupFile03").files[0];
    const result = await fileHandle.file_upload(file, "/contract/certificate/verify", "certificate_file");

    if (result.message == "Authed") {
        $("#return_btn").show();
        $("#next_btn").show();

        fileHandle.pdfView(page);
    } else {
        console.log("certificate file no cert");
    }
});
*/

sign_btn.addEventListener("click", () => {
    document.getElementById("sign_container").innerHTML = `
        <h3>Your Signature Sign</h3>
        <canvas id="canvas" width="250" height="80"></canvas>
        <div class="sign_btn_class">
            <button id="redraw">Redraw Sign</button>
            <button id="save">Sign Ok</button>
        </div>
        `;

    signHandle.drawSign();
});

return_btn.addEventListener("click", () => {
    if (page > 1) {
        page = page - 1;
        fileHandle.pdfView(page);
    }
});

next_btn.addEventListener("click", () => {
    page = page + 1;
    fileHandle.pdfView(page);
});

chat_btn.addEventListener("click", () => {
    const msg = document.getElementById("chatting_message").value;
    const organizer_username = location.pathname.split("/")[3]; 

    socket.emit("message_send", document.cookie, organizer_username, msg);

    document.getElementById("chatting_message").value = "";
});

socket.on("message", (message) => {
    const username = message.split(":")[1];
    const chat_message = message.split(":")[2];
    const time = message.split(":")[3] + ":" + message.split(":")[4];

    chat_form.innerHTML += `
        <div class="chat-message">
            <span class="sender">${username}:</span> ${chat_message}
            <span class="timestamp">${time}</span>
        </div>
    `;
});

socket.on("join_room", (message, username) => {
    if (message.includes("fail")) {
        location.href = "/";
    } else {
        chat_form.innerHTML += `
        <div class="chat-message">
            <span class="sender">System:</span> join to ${username}
            <span class="timestamp">System</span>
        </div>
    `;
    }
});