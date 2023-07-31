import fileHandle from "./modules/file.module.js";
import rtc from "./modules/webRTC.module.js";
import event from "./modules/event.module.js";
import comment from "./modules/pdf_comment.module.js";

const return_btn = document.getElementById("return_btn");
const next_btn = document.getElementById("next_btn");
const sign_btn = document.getElementById("sign_contract_btn");
const chat_btn = document.getElementById("send_chat_btn");
const close_btn = document.getElementById("close_contract_btn");
const inputContainer = document.getElementById('inputContainer');
const load_btn = document.getElementById("load_contract_btn");
const speak_btn = document.getElementById("speak_contract_btn");
const cancel_popup_btn = document.getElementById("close_popup");

const socket = window.io("https://219.255.230.120:8000", { transports : ['polling'], path: "/socket.io" });

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.min.js';
pdfjsLib.GlobalWorkerOptions.disableFontFace = true;
pdfjsLib.GlobalWorkerOptions.maxImageSize = 1024 * 1024;

let page = 1;
let tts_toggle = 0;

rtc.webRTC(socket);
event.socketEvent(socket, page);
localStorage.setItem("page", page);

$("#return_btn").hide();
$("#next_btn").hide();
$("#popupOverlay").hide();

speak_btn.addEventListener("click", () => {
    const pdf_obj = document.getElementById("pdf_object");

    tts_toggle += 1;

    if (tts_toggle % 2 == 0) {
        speak_btn.style.backgroundColor = "white";

        const ttsElement = document.getElementById("tts");
        const speakDiv = document.getElementById("speak");

        if (ttsElement != null) {
            speakDiv.removeChild(ttsElement);
        }
    } else {
        speak_btn.style.backgroundColor = "green";

        if (pdf_obj != null) {
            const page_num = localStorage.getItem("page");
    
            $("#stop_tts_btn").show();
    
            document.getElementById("speak").innerHTML = `
            <audio src="/contract/speak/${page_num}" type="audio/mpeg" controls autoplay hidden></audio>
            `;
        } else {
            document.getElementById("speak").innerHTML = `
                <audio src="/contract/speak/0" type="audio/mpeg" id="tts" controls autoplay hidden></audio>
            `;
        }
    }
});

cancel_popup_btn.addEventListener("click", () => {
    $("#popupOverlay").hide();
    $("#accept_load_btn").hide();
    $("#accept_sign_btn").hide();
    $("#accept_exit_btn").hide();
});

load_btn.addEventListener("click", () => {
    document.getElementById("sign_msg").innerText = `계약서를 로딩하고 계약을 시작하시겠습니까?, 계약룸에 모두 참가하고 있으셔야합니다.`;
    
    $("#accept_load_btn").show();
    $("#close_popup").show();
    $("#accept_sign_btn").hide();
    $("#accept_exit_btn").hide();
    $("#popupOverlay").show();
    
    document.getElementById("accept_load_btn").addEventListener("click", () => {
        $("#accept_load_btn").hide();
        $("#close_popup").hide();

        document.getElementById("sign_msg").innerText = `상대방의 승인을 대기중입니다... 잠시만 기다려주세요.`;
        
        socket.emit("contract_load_request");
    });
});

sign_btn.addEventListener("click", () => {
    document.getElementById("sign_msg").innerText = `계약서 서명, 체결 요청을 보내시겠습니까?`;
    
    $("#accept_load_btn").hide();
    $("#accept_sign_btn").show();
    $("#accept_exit_btn").hide();
    $("#close_popup").show();
    $("#popupOverlay").show();

    document.getElementById("accept_sign_btn").addEventListener("click", () => {
        $("#accept_sign_btn").hide();
        $("#close_popup").hide();

        document.getElementById("sign_msg").innerText = `상대방의 요청 승인을 대기중입니다... 잠시만 기다려주세요.`;
        
        socket.emit("contract_sign_request");
    });
});

return_btn.addEventListener("click", () => {
    if (page > 1) {
        page = page - 1;
        localStorage.setItem("page", page);
        fileHandle.pdfView(page, socket);
    }
});

next_btn.addEventListener("click", () => {
    page = page + 1;
    localStorage.setItem("page", page);
    fileHandle.pdfView(page, socket);
});

chat_btn.addEventListener("click", () => {
    const msg = document.getElementById("chatting_message").value;
    const organizer_username = location.pathname.split("/")[3]; 

    socket.emit("message_send", document.cookie, organizer_username, msg);

    document.getElementById("chatting_message").value = "";
});

document.getElementById("chatting_message").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        const msg = document.getElementById("chatting_message").value;
        const organizer_username = location.pathname.split("/")[3]; 

        socket.emit("message_send", document.cookie, organizer_username, msg);

        document.getElementById("chatting_message").value = "";
    }
});

close_btn.addEventListener("click", () => {
    document.getElementById("sign_msg").innerText = `정말로 해당 계약룸을 나가시겠습니까?`;
    
    $("#accept_load_btn").hide();
    $("#accept_sign_btn").hide();
    $("#accept_exit_btn").show();
    $("#close_popup").show();
    $("#popupOverlay").show();
    
    document.getElementById("accept_exit_btn").addEventListener("click", async () => {
        await socket.emit("exit_room");
    });
});

inputContainer.addEventListener("input", comment.saveInputBox);