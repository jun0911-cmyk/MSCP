const socketMiddle = require("./middlewares/socket.middleware.js");
const roomToUser = [];

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

            io.to(roomName).emit("join_room", `room join success`, authData.user.username);
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

        socket.on("disconnect", async () => {
            const roomData = roomToUser[socket.id];

            if (roomData) {
                const room_people = Number(roomData.room.room_people);
                
                let room_update_people = String(room_people - 1);

                if (Number(room_update_people) < 0) {
                    room_update_people = String(0);
                }

                await socketMiddle.updatePeople(roomData.room.organizer_id, room_update_people);

                io.to(roomData.roomName).emit("exited_room", roomData.user.username);
            }
        });
    });
};