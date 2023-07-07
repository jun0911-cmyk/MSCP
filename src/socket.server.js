const socketMiddle = require("./middlewares/socket.middleware.js");

module.exports = (io) => {
    io.on("connection",  function (socket) {
        socket.on("join_room", async (cookie, organizer_username) => {
            const authData = await socketMiddle.authRoom(cookie, organizer_username);

            if (authData == null) {
                return socket.emit("join_room", `fail join not authed`);
            }

            const roomName = authData.roomData.dataValues.organizer_id + "_contract_room";

            socket.join(roomName);

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
    });
};