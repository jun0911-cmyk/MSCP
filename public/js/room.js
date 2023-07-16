import fileHandle from "./modules/file.module.js";
import rtc from "./modules/webRTC.module.js";
import event from "./modules/event.module.js";

const return_btn = document.getElementById("return_btn");
const next_btn = document.getElementById("next_btn");
const sign_btn = document.getElementById("sign_contract_btn");
const chat_btn = document.getElementById("send_chat_btn");
const close_btn = document.getElementById("close_contract_btn");

const socket = window.io("https://219.255.230.120:8000", { transports : ['polling'], path: "/socket.io" });

let page = 1;

rtc.webRTC(socket);
event.socketEvent(socket, page);

$("#return_btn").hide();
$("#next_btn").hide();

sign_btn.addEventListener("click", () => {
    document.getElementById("sign_msg").innerText = `Are you request contract file sign?`;
    document.getElementById("popupOverlay").style.display = "block";
    document.getElementById("accept_sign_btn").addEventListener("click", () => {
        $("#accept_sign_btn").hide();

        document.getElementById("sign_msg").innerText = `Waiting Another Present Accept...`;
        
        socket.emit("contract_sign_request");
    });
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

close_btn.addEventListener("click", () => {
    document.getElementById("sign_msg").innerText = `Are you sure exit this contract room?`;
    document.getElementById("accept_sign_btn").innerText = "Exit";
    document.getElementById("popupOverlay").style.display = "block";
    document.getElementById("accept_sign_btn").addEventListener("click", async () => {
        await socket.emit("exit_room");

        location.href = "/";
    });
});