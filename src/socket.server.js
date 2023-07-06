const socketMiddle = require("./middlewares/socket.middleware.js");

module.exports = (io) => {
    io.on("connection",  function (socket) {
        socket.on("join_room", async (cookie, organizer_username) => {
            try {
                const user = await socketMiddle.parseUser(cookie);

                if (user == null) {
                    socket.emit("join_room", "fail join room, user not auth");
                }

                const roomCheck = await socketMiddle.checkRoomUser(organizer_username, user);

                if (roomCheck == null) {
                    socket.emit("join_room", "fail join room, room not found");     
                }

                const roomName = roomCheck.room.dataValues.organizer_id + "_contract_room"

                socket.join(roomName);

                await socketMiddle.updatePeople(roomCheck.room.dataValues.organizer_id, io.sockets.adapter.rooms.get(roomName).size);

                socket.emit("join_room", `room join success`);
            } catch (err) {
                socket.emit("join_room", "fail join room, room not found");
            }
        });
    });
};