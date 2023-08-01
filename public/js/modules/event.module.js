import RTC from "./webRTC.module.js";
import fileHandle from "./file.module.js";
import signHandle from "./sign.module.js";
import comment from "./pdf_comment.module.js";

const socketEvent = (socket, page) => {
    const chat_form = document.getElementById("chat-form");

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

    socket.on("join_room", (message) => {
        if (message.includes("fail")) {
            location.href = "/";
        } else {
            RTC.createOffer(socket);

            socket.emit("append_join_msg");
        }
    });

    socket.on("append_join_msg", (username) => {
        chat_form.innerHTML += `
            <div class="chat-message">
                <span class="sender">System:</span> ${username} 계약자가 접속하였습니다.
                <span class="timestamp">System</span>
            </div>
            `;
    });

    socket.on("exited_room", (username) => {
        if (username) {
            chat_form.innerHTML += `
            <div class="chat-message">
                <span class="sender">System:</span> ${username} 계약자가 계약룸을 나갔습니다.
                <span class="timestamp">System</span>
            </div>
            `;
        }
    });

    socket.on("rtc_getOffer", (sdp) => {
        RTC.createAnswer(sdp, socket);
    });


    socket.on("rtc_getAnswer", (sdp) => {
        RTC.setRemoteSDP(sdp);     
    });


    socket.on("rtc_getCandidate", (candidate) => {
        RTC.addCandidate(candidate);     
    });

    socket.on("contract_sign_request", (contractor_username) => {
        document.getElementById("sign_msg").innerText = `계약서 서명, 체결 요청이 도착했습니다, 해당 계약서를 서명하시려면 승인버튼을 눌러주세요. 요청한 계약자 : ${contractor_username}`;

        $("#accept_load_btn").hide();
        $("#accept_exit_btn").hide();
        $("#close_popup").hide();
        
        $("#accept_sign_btn").show();
        $("#reject_sign_btn").show();
        $("#popupOverlay").show();

        document.getElementById("accept_sign_btn").addEventListener("click", () => {
            $("#reject_sign_btn").hide();

            socket.emit("contract_sign_request_accept", contractor_username);
        });

        document.getElementById("reject_sign_btn").addEventListener("click", () => {
            $("#reject_sign_btn").hide();
            $("#popupOverlay").hide();

            socket.emit("contract_sign_request_reject");
        });
    });

    socket.on("contract_load_request", (contractor_username) => {
        document.getElementById("sign_msg").innerText = `상대방으로부터 계약 시작 요청이 왔습니다, 계약서를 로드하고 계약을 진행하시려면 승인 버튼을 눌러주세요. 요청한 계약자 : ${contractor_username}`;
        
        $("#accept_sign_btn").hide();
        $("#accept_exit_btn").hide();
        $("#close_popup").hide();

        $("#reject_load_btn").show();
        $("#accept_load_btn").show();
        $("#popupOverlay").show();

        document.getElementById("accept_load_btn").addEventListener("click", () => {
            $("#reject_load_btn").hide();
        
            socket.emit("contract_load_request_accept", contractor_username);
        });
        
        document.getElementById("reject_load_btn").addEventListener("click", () => {
            $("#reject_load_btn").hide();
            $("#popupOverlay").hide();
        
            socket.emit("contract_load_request_reject");
        });
    });

    socket.on("contract_sign_request_accept", () => {
        $("#accept_sign_btn").hide();
        $("#close_popup").hide();

        document.getElementById("sign_msg").innerText = "";
        document.getElementById("sign_content").innerHTML = `
        <p>계약서와 계약 인증서에 첨부될 계약자 서명을 진행해주세요.</p>
        <canvas id="canvas" width="250" height="80"></canvas>
        <div class="sign_btn_class">
            <button id="redraw">다시 서명하기</button>
            <button id="save">서명완료</button>
        </div>
        `;

        signHandle.drawSign(socket);
    });

    socket.on("contract_load_request_accept", () => {
        fileHandle.pdfView(page, socket);

        $("#accept_load_btn").hide();
        $("#popupOverlay").hide();

        $("#save_contract_btn").show();
        $("#return_btn").show();
        $("#next_btn").show();
    });

    socket.on("contract_load_request_reject", () => {
        document.getElementById("sign_msg").innerText = `상대방으로부터 계약 시작 요청이 거절되었습니다, 다시 시도해주세요.`;

        $("#close_popup").show();
    });

    socket.on("contract_sign_request_reject", () => {
        document.getElementById("sign_msg").innerText = `상대방으로부터 계약서 서명 요청이 거절되었습니다, 다시 시도해주세요.`;

        $("#close_popup").show();
    });

    socket.on("contract_sign_request_failure", (message) => { 
        if (message == "not enough room user") {
            $("#accept_load_btn").hide();
            $("#close_popup").show();

            document.getElementById("sign_msg").innerText = "계약룸 시작요청에 실패하였습니다, 계약룸안에 계약자가 접속해있지 않습니다.";
        }
    });

    socket.on("contract_load_request_failure", (message) => { 
        if (message == "not enough room user") {
            $("#accept_sign_btn").hide();
            $("#close_popup").show();

            document.getElementById("sign_msg").innerText = "서명요청에 실패하였습니다, 계약룸안에 계약자가 접속해있지 않습니다.";
        }
    });

    socket.on("contract_sign_success", () => {
        document.getElementById("sign_content").innerHTML = `
            <p>계약 체결 NFT 인증서가 성공적으로 발급되고, 계약이 체결되었습니다! (계약서 체결 인증서가 다운되었습니다.)</p>
        `;
        document.getElementById("downSignPDF").innerHTML = ` <embed id="downSignPDF" src="/contract/sign/download" type="application/pdf">`;

        $("#close_popup").show();
    });

    socket.on("comment_send", (inputBoxObj, page) => {
        const now_page = localStorage.getItem("page");
        
        if (now_page == page) {
            comment.addComment(inputBoxObj);
        }
    });

    socket.on("exit_redirect", () => {
        localStorage.clear();

        location.href = "/";
    });
}

export default {
    socketEvent,
};