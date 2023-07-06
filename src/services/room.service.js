const models = require("../models");
const logger = require("../middlewares/log.middleware.js");

const getRooms = async () => {
    try { 
        return await models.room.findAll();
    } catch (err) {
        logger("room list get Error : " + err, "err");
        return null;
    }
}

const getOrganizer = async (username) => {
    try {
        return await models.user.findOne({
            where: {
                username: username,
            }
        });
    } catch (err) {
        return null;
    }
}

const updatePeople = async (room_id, room_people) => {
    try {
        await models.room.update(
            { room_people: room_people },
            { where: { organizer_id: room_id } }
        );
    } catch (err) {
        logger("sequelize update Err", err, "err");
    }
}

class CreateRoom {
    constructor(organizer_id, organizer_username, participant_username) {
        this.organizer_id = organizer_id;
        this.organizer_username = organizer_username;
        this.participant_username = participant_username;
    }

    async checkParticipant() {
        try {
            return await models.user.findOne({
                where: {
                    username: this.participant_username,
                }
            });
        } catch (err) {
            return null;
        }
    }

    async existRoom() {
        try {
            return await models.room.findOne({
                where: {
                    organizer_id: this.organizer_id,
                }
            });
        } catch (err) {
            return null;
        }
    }

    async create() {
        const participant = await this.checkParticipant();

        if (participant) {
            const participant_id = participant.dataValues.id;
            const room_name = `${this.organizer_username}'s contract room`;
            
            try {
                return await models.room.create({
                    organizer_id: this.organizer_id,
                    participant_id: participant_id,
                    organizer_username: this.organizer_username,
                    participant_username: this.participant_username,
                    room_name: room_name,
                    room_pin: "0000",
                });
            } catch (err) {
                logger("room create error : " + err, "err");
                return null;
            }
        } else {
            return null;
        }
    }
}

module.exports.getRooms = getRooms;
module.exports.getOrganizer = getOrganizer;
module.exports.updatePeople = updatePeople;
module.exports.CreateRoom = CreateRoom;