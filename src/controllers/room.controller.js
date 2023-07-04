const path = require("path");
const { CreateRoom, getRooms } = require("../services/room.service.js");

const generateRooms = async (rooms) => {
    const room_list = [];

    for (let i = 0; i <= rooms.length - 1; i++) {
        const room = await rooms[i];
        const organizer_username = room.dataValues.organizer_username;
        const participant_username = room.dataValues.participant_username;
        const room_name = room.dataValues.room_name;
        const room_people = room.dataValues.room_people;

        room_list[i] = {
            organizer_username: organizer_username,
            participant_username: participant_username,
            room_name: room_name,
            room_people: String(room_people),
        }
    }

    return room_list;
}

module.exports.renderRoomPage = (req, res, next) => {
    res.sendFile(path.join(__dirname + "/../../public/views/room.html"));
}

module.exports.roomList = async (req, res, next) => {
    const rooms = await getRooms();

    if (rooms == null) {
        return res.json({
            status: 400,
        }).status(400);
    }

    const room_list = await generateRooms(rooms);

    return res.json({
        status: 200,
        rooms: room_list
    }).status(200);
}

module.exports.createRoom = async (req, res, next) => {
    const organizer_id = req.id;
    const organizer_username = req.username;
    const participant_username = req.body.access;

    const createRoom = new CreateRoom(organizer_id, organizer_username, participant_username);

    if (await createRoom.existRoom() !== null) {
        return res.json({
            status: 400,
            message: "room exists",
        }).status(400);
    }

    const room = await createRoom.create();

    if (room === null) {
        return res.json({
            status: 400,
            message: "room create failure",
        }).status(400);
    }

    return res.json({
        status: 200,
        message: "created room",
    }).status(200);
}