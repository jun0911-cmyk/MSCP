const jwtAuth = require("./controllers/jwt.controller.js");
const redis = require("./middlewares/redis.moddleware.js");

const parseUser = async (cookie) => {
    let user = {}

    const accessToken = cookie.split("=")[1];
    
    user = await jwtAuth("socket", accessToken, user);     
    
    if (user == null) {
        return null;
    }

    try {
        const auth = await redis.get(user.id + "_authed");

        if (auth == null || auth == undefined) {
            return null;
        }

        return user;
    } catch (err) {
        return null;
    }
}

module.exports = (io, cookieParser) => {
    const room = io.of("/room/contract");

    room.use((socket, next) => {
        cookieParser()(socket.request, socket.request.res || {}, next);
    }).on("connection",  function (socket) {
        socket.on("join_room", async (cookie) => {
            const user = await parseUser(cookie);

            if (user == null) {
                socket.emit("join_room", "fail join room, user not auth");
            }

            
        });
    });
};