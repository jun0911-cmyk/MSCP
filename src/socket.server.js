const socketMiddle = require("./middlewares/socket.middleware.js");
const redis = require("./middlewares/redis.moddleware.js");
const { clearContractData, deleteRoom } = require("./services/contract.service.js");
const roomToUser = [];

const updateRoomPeople = (io, roomName) => {
    let room_update_people = String(io.sockets.adapter.rooms.get(roomName).size - 1);

    if (Number(room_update_people) < 0) {
        room_update_people = String(0);
    }

    return room_update_people;
}

module.exports = (io) => {
    io.on("connection",  function (socket) {
        socket.on("join_room", async (cookie, organizer_username) => {
            const authData = await socketMiddle.authRoom(cookie, organizer_username);

            if (authData == null) {
                return socket.emit("join_room", `fail join not authed`);
            }

            const roomName = authData.roomData.dataValues.organizer_id + "_contract_room";

            socket.join(roomName);

            roomToUser[socket.id] = {
                room: authData.roomData.dataValues,
                roomName: roomName,
                user:authData.user,
            };

            await socketMiddle.updatePeople(authData.roomData.dataValues.organizer_id, io.sockets.adapter.rooms.get(roomName).size);

            io.sockets.to(socket.id).emit("join_room", `room join success`, authData.user.username, io.sockets.adapter.rooms.get(roomName).size);
        });

        socket.on("append_join_msg", () => {
            const roomData = roomToUser[socket.id];

            if (roomData) {
                io.to(roomData.roomName).emit("append_join_msg", roomData.user.username);
            }
        });

        socket.on("message_send", async (cookie, organizer_username, message) => {
            const authData = await socketMiddle.authRoom(cookie, organizer_username);
            const date = new Date();
            const time = `${String(date.getHours())}:${String(date.getMinutes())}`;

            if (authData == null) {
                return null;
            }

            const roomName = authData.roomData.dataValues.organizer_id + "_contract_room";

            if (/(\b)(on\S+)(\s*)=|javascript|<(|\/|[^\/>][^>]+|\/[^>][^>]+)>/ig.test(message) || message == "") {
                return null;
            }

            io.to(roomName).emit("message", `message:${authData.user.username}:${message}:${time}`);
        });

        socket.on("rtc_offer", (sdp) => {
            const roomData = roomToUser[socket.id];
            
            if (roomData) {
                socket.broadcast.to(roomData.roomName).emit("rtc_getOffer", sdp);
            }
        });

        socket.on("rtc_answer", (sdp) => {
            const roomData = roomToUser[socket.id];

            if (roomData) {
                socket.broadcast.to(roomData.roomName).emit("rtc_getAnswer", sdp);
            }
        });

        socket.on("rtc_candidate", (candidate) => {
            const roomData = roomToUser[socket.id];

            if (roomData) {
                socket.broadcast.to(roomData.roomName).emit("rtc_getCandidate", candidate);
            }
        });

        socket.on("contract_sign_request", async () => {
            const roomData = roomToUser[socket.id];
            const roomSize = io.sockets.adapter.rooms.get(roomData.roomName).size;

            if (roomData && roomSize == 2) {
                socket.broadcast.to(roomData.roomName).emit("contract_sign_request", roomData.user.username);
            } else {
                io.sockets.to(socket.id).emit("contract_sign_request_failure", "not enough room user");
            }
        });

        socket.on("contract_sign_request_accept", async (contractor_username) => {
            const roomData = roomToUser[socket.id];
            const roomSize = io.sockets.adapter.rooms.get(roomData.roomName).size;

            if (roomData && roomSize == 2) {
               if (roomData.room.organizer_username == contractor_username) {
                    roomToUser[socket.id]["role"] = "participant";
                    
                    io.to(roomData.roomName).emit("contract_sign_request_accept");
               } else if (roomData.room.participant_username == contractor_username) {
                    roomToUser[socket.id]["role"] = "organizer";

                    io.to(roomData.roomName).emit("contract_sign_request_accept");
               }
            } else {
                io.sockets.to(socket.id).emit("contract_sign_request_failure", "not enough room user");
            }
        });

        socket.on("contract_sign_success", async () => {
            const roomData = roomToUser[socket.id];
            const roomSize = io.sockets.adapter.rooms.get(roomData.roomName).size;

            if (roomData && roomSize == 2) {
                const signCheckOriganizer = await redis.get(roomData.room.organizer_id + "_signed");
                const signCheckParticipant = await redis.get(roomData.room.participant_id + "_signed");

                if (signCheckOriganizer && signCheckParticipant) {
                    if (roomData.room.organizer_id == roomData.user.id || roomData.room.participant_id == roomData.user.id) {
                        io.to(roomData.roomName).emit("contract_sign_success");
                    }
                }
            } else {
                io.sockets.to(socket.id).emit("contract_sign_request_failure", "not enough room user");
            }
        });

        socket.on("contract_load_request", async () => {
            const roomData = roomToUser[socket.id];
            const roomSize = io.sockets.adapter.rooms.get(roomData.roomName).size;

            if (roomData && roomSize == 2) {
                socket.broadcast.to(roomData.roomName).emit("contract_load_request", roomData.user.username);
            } else {
                io.sockets.to(socket.id).emit("contract_load_request_failure", "not enough room user");
            }
        });

        socket.on("contract_load_request_accept", async (contractor_username) => {
            const roomData = roomToUser[socket.id];
            const roomSize = io.sockets.adapter.rooms.get(roomData.roomName).size;

            if (roomData && roomSize == 2) {
                io.to(roomData.roomName).emit("contract_load_request_accept");
            }
        });

        socket.on("contract_load_request_reject", async () => {
            const roomData = roomToUser[socket.id];
            const roomSize = io.sockets.adapter.rooms.get(roomData.roomName).size;

            if (roomData && roomSize == 2) {
                socket.broadcast.to(roomData.roomName).emit("contract_load_request_reject");
            }
        });

        socket.on("contract_sign_request_reject", async () => {
            const roomData = roomToUser[socket.id];
            const roomSize = io.sockets.adapter.rooms.get(roomData.roomName).size;

            if (roomData && roomSize == 2) {
                socket.broadcast.to(roomData.roomName).emit("contract_sign_request_reject");
            } else {
                io.sockets.to(socket.id).emit("contract_load_request_failure", "not enough room user");
            }
        });

        socket.on("comment_send", (inputBoxObj, page) => {
            const roomData = roomToUser[socket.id];

            if (roomData && inputBoxObj.text != "") {
                io.to(roomData.roomName).emit("comment_send", inputBoxObj, page);
            }
        });

        socket.on("exit_room", async () => {
            const roomData = roomToUser[socket.id];
            
            if (roomData) {
                const user_id = roomData.user.id.split("-");
                const id = user_id[0] + user_id[1] + user_id[2] + user_id[3] + user_id[4];
                const update_people = updateRoomPeople(io, roomData.roomName);
                const signData = await redis.get(roomData.user.id + "_signed");

                await redis.del(roomData.user.id + "_authed");
                await socketMiddle.updatePeople(roomData.room.organizer_id, update_people);

                if (signData != null) {
                    await redis.del(roomData.user.id + "_signed");
                }

                if (update_people == 0) {
                    await deleteRoom(roomData.room.organizer_id);
                }

                try {
                    const signFile = await redis.get(roomData.user.id + "_signFile");
                    const contractFile = await redis.get(id);

                    await redis.del(roomData.user.id);

                    if (signFile && contractFile) {
                        await clearContractData(signFile, contractFile);
                    }

                    socket.leave(roomData.roomName);

                    io.to(roomData.roomName).emit("exited_room", roomData.user.username);

                    roomToUser[socket.id] = null;

                    io.sockets.to(socket.id).emit("exit_redirect");
                } catch (err) {
                    socket.leave(roomData.roomName);

                    io.to(roomData.roomName).emit("exited_room", roomData.user.username);

                    roomToUser[socket.id] = null;

                    io.sockets.to(socket.id).emit("exit_redirect");
                }
            }
        });

        socket.on("disconnecting", async () => {
            const roomData = roomToUser[socket.id];

            if (roomData) {
                let room_update_people = String(io.sockets.adapter.rooms.get(roomData.roomName).size - 1);

                if (Number(room_update_people) < 0) {
                    room_update_people = String(0);
                }

                await socketMiddle.updatePeople(roomData.room.organizer_id, room_update_people);

                io.to(roomData.roomName).emit("exited_room", roomData.user.username);
            }
        });
    });
};