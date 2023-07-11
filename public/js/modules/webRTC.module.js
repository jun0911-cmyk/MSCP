const pc_config = {};

(async() => {
  const response = await axios.get("https://mscp_turn.metered.live/api/v1/turn/credentials?apiKey=fd18020bdcffe24cf5ee7f008da52d262fbd");
  const iceServers = response.data;
  pc_config.iceServers = iceServers;
})();

const pc = new RTCPeerConnection(pc_config);

let localVideo = document.getElementById("local");
let remoteVideo = document.getElementById("remote");
let localStream = null;
let video_toggle = 0;
let audio_toggle = 0;

document.getElementById("videoToggle").addEventListener("click", () => {
    const element = document.getElementById("videoToggle");

    video_toggle += 1;

    if (localStream) {
        if (video_toggle % 2 == 0) {
            element.style.backgroundColor = "#ea4435";
            element.style.innerText = "Muted Video";
            
            localStream.getVideoTracks().forEach(function(track) {
                track.enabled = false;
            });
        } else {
            element.style.backgroundColor = "#545454";
            element.style.innerText = "Opened Video";
            
            localStream.getVideoTracks().forEach(function(track) {
                track.enabled = true;
            });
        }
    }
});

document.getElementById("audioToggle").addEventListener("click", () => {
    const element = document.getElementById("audioToggle");

    audio_toggle += 1;

    if (localStream) {
        if (audio_toggle % 2 == 0) {
            element.style.backgroundColor = "#ea4435";
            element.style.innerText = "Muted Audio";
            
            localStream.getAudioTracks().forEach(function(track) {
                track.enabled = false;
            });
        } else {
            element.style.backgroundColor = "#545454";
            element.style.innerText = "Opened Audio";
            
            localStream.getAudioTracks().forEach(function(track) {
                track.enabled = true;
            });
        }
    }
});

const autoMute = (stream) => {
    stream.getVideoTracks().forEach(function(track) {
        track.enabled = false;
    });

    stream.getAudioTracks().forEach(function(track) {
        track.enabled = false;
    });
}

const webRTC = (socket) => {
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    }).then((stream) => {
        autoMute(stream);

        localStream = stream;
        localVideo.srcObject = stream;
    
        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });
    
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("rtc_candidate", event.candidate); 
            }
        }

        pc.onconnectionstatechange = (event) => {
            console.log(pc.iceConnectionState);
        }
    
        pc.ontrack = (event) => {
            remoteVideo.srcObject = event.streams[0];
        }
    
        socket.emit("join_room", document.cookie, location.pathname.split("/")[3]);
    }).catch(err => {
        console.log(err);
    });
}

const createOffer = (socket) => {
    pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        iceRestart: true
    }).then((offer) => {
        pc.setLocalDescription(new RTCSessionDescription(offer));

        console.log("offer createed : " + offer);

        socket.emit("rtc_offer", offer);
    }).catch((err) =>  {
        console.log(err);
    });
};

const createAnswer = (offer, socket) => {
    pc.setRemoteDescription(new RTCSessionDescription(offer)).then(() => {
        pc.createAnswer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
            iceRestart: true
        }).then((answer) => {
            pc.setLocalDescription(new RTCSessionDescription(answer));

            socket.emit("rtc_answer", answer);
        }).catch((err) => {
            console.log(err);
        })
    }).catch((err) => {
        console.log(err);
    });
}

const setRemoteSDP = (sdp) => {
    pc.setRemoteDescription(new RTCSessionDescription(sdp));
};

const addCandidate = (candidate) => {
    pc.addIceCandidate(new RTCIceCandidate(candidate)).then(() => {
        console.log("candidate add success");
    });
}

export default {
    setRemoteSDP,
    createAnswer,
    createOffer,
    addCandidate,
    webRTC,
};