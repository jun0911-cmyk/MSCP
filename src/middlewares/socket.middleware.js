const jwtAuth = require("../controllers/jwt.controller.js");
const redis = require("./redis.moddleware.js");
const { getOrganizer, CreateRoom, updatePeople } = require("../services/room.service.js");

module.exports.updatePeople = updatePeople;


module.exports.parseUser = async (cookie) => {
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

module.exports.checkRoomUser = async (organizer_username, user) => {
    const participant_username = user.username;
    const organizer = await getOrganizer(organizer_username);

    if (organizer == null) {
        return null;
    }

    const organizer_id = organizer.dataValues.id;
    const createRoom = new CreateRoom(organizer_id, null, null);
    const room = await createRoom.existRoom();

    if (room == null) {
        return null;
    }

    try {
        const certificateCheck = await redis.get(user.id + "_authed"); 
        const accessID = certificateCheck.split("_")[1];


        if ((room.dataValues.participant_username == participant_username && room.dataValues.participant_id == accessID)) {
            const role = "organizer";
            return {
                role, room
            };
        }

        else if ((room.dataValues.organizer_username == user.username && room.dataValues.organizer_id == accessID)) { 
            const role = "participant";
            return {
                role, room
            };
        } 
        
        else {
            return null;
        }
    } catch (err) {
        return null;
    }
}