import RTC from "./webRTC.module.js";

const socketEvent = (socket) => {
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

    socket.on("join_room", (message, username, size) => {
        if (message.includes("fail")) {
            location.href = "/";
        } else {
            RTC.createOffer(socket);

            chat_form.innerHTML += `
            <div class="chat-message">
                <span class="sender">System:</span> join to ${username}
                <span class="timestamp">System</span>
            </div>
            `;
        }
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
}

export default {
    socketEvent,
};