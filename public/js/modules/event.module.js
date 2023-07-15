import RTC from "./webRTC.module.js";
import fileHandle from "./file.module.js";
import signHandle from "./sign.module.js";

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
            fileHandle.pdfView(page);

            $("#return_btn").show();
            $("#next_btn").show();

            socket.emit("append_join_msg");
        }
    });

    socket.on("append_join_msg", (username) => {
        chat_form.innerHTML += `
            <div class="chat-message">
                <span class="sender">System:</span> join to ${username}
                <span class="timestamp">System</span>
            </div>
            `;
    });

    socket.on("exited_room", (username) => {
        if (username) {
            chat_form.innerHTML += `
            <div class="chat-message">
                <span class="sender">System:</span> exited room to ${username}
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
        document.getElementById("sign_msg").innerText = `Request Sign To Contract File, Request user : ${contractor_username}`;
        document.getElementById("popupOverlay").style.display = "block";
        document.getElementById("accept_sign_btn").addEventListener("click", () => {
            socket.emit("contract_sign_request_accept", contractor_username);
        });
    });

    socket.on("contract_sign_request_accept", () => {
        $("#accept_sign_btn").hide();

        document.getElementById("sign_msg").innerText = "";
        document.getElementById("contract_sign_content").innerHTML = `
        <p>Your Signature Sign For Sign</p>
        <canvas id="canvas" width="250" height="80"></canvas>
        <div class="sign_btn_class">
            <button id="redraw">Redraw Sign</button>
            <button id="save">Sign</button>
        </div>
        `;

        signHandle.drawSign();
    });
}

export default {
    socketEvent,
};