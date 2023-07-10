const pc_config = {
    "iceServers": [
        {
            urls: "stun:stun.l.google.com:19302",
        }
    ]
};

const newPC = new RTCPeerConnection(pc_config);

let localVideo = document.getElementById("local");
let remoteVideo = document.getElementById("remote");

const webRTC = (socket) => {
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    }).then((stream) => {
        localVideo.srcObject = stream;
    
        stream.getTracks().forEach(track => {
            newPC.addTrack(track, stream);
        });
    
        newPC.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("rtc_candidate", event.candidate); 
            }
        }
    
        newPC.ontrack = (event) => {
            remoteVideo.srcObject = event.streams[0];
        }
    
        socket.emit("join_room", document.cookie, location.pathname.split("/")[3]);
    }).catch(err => {
        console.log(err);
    });
}

const createOffer = (socket) => {
    newPC.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
    }).then((sdp) => {
        const set_sdp = new RTCPeerConnection(sdp);

        newPC.setLocalDescription(set_sdp);
        
        socket.emit("rtc_offer", sdp);
    }).catch((err) =>  {
        console.log(err);
    });
};

const createAnswer = (sdp, socket) => {
    const set_sdp = new RTCSessionDescription(sdp);

    newPC.setRemoteDescription(set_sdp).then(() => {
        newPC.createAnswer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
        }).then((re_sdp) => {
            const re_set_sdp = new RTCPeerConnection(re_sdp);

            newPC.setLocalDescription(re_set_sdp);
            
            socket.emit("rtc_answer", re_sdp);
        }).catch((err) => {
            console.log(err);
        })
    }).catch((err) => {
        console.log(err);
    });
}

const setRemoteSDP = (sdp) => {
    const reSDP = new RTCSessionDescription(sdp);

    newPC.setRemoteDescription(reSDP);
};

const addCandidate = async (candidate) => {
    const candidate_set = new RTCIceCandidate(candidate);

    newPC.addIceCandidate(candidate_set).then(() => {
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