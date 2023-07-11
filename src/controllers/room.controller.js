const path = require("path");
const { CreateRoom, getRooms, getOrganizer, getRoomFromUser, checkRoom } = require("../services/room.service.js");
const redis = require("../middlewares/redis.moddleware.js");

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

    const participant = await createRoom.checkParticipant();

    let participantExist = null;

    if (participant !== null) {
        participantExist = await getRoomFromUser(participant.dataValues.id);
    }

    if (await createRoom.existRoom() !== null || participantExist !== null) {
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

module.exports.joinRoom = async (req, res, next) => {
    const organizer_username = req.params.oww_username;
    const participant_username = req.username;
    const organizer = await getOrganizer(organizer_username);

    if (organizer == null) {
        return res.redirect("/");
    }

    const organizer_id = organizer.dataValues.id;
    const room = await checkRoom(organizer_id);

    if (room == null) {
        return res.redirect("/");
    }

    try {
        const certificateCheck = await redis.get(req.id + "_authed"); 
        const accessID = certificateCheck.split("_")[1];

        if (
            (room.dataValues.participant_username == participant_username && room.dataValues.participant_id == accessID) ||
            (room.dataValues.organizer_username == req.username && room.dataValues.organizer_id == accessID)
        ) { 
            return res.sendFile(path.join(__dirname + "/../../public/views/room.html"));
        } else {
            return res.redirect("/");
        }
    } catch (err) {
        return res.redirect("/");
    }
}