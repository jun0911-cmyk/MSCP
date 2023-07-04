module.exports = (sequelize, DataTypes) => {
    return sequelize.define("room", {
        organizer_id: {
            type: DataTypes.STRING(36),
            allowNull: false,
            primaryKey: true
        },
        participant_id: {
            type: DataTypes.STRING(36),
            allowNull: false,
        },
        organizer_username: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        participant_username: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        room_name: {
            type: DataTypes.STRING(36),
            allowNull: false,
            primaryKey: true
        },
        room_pin: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        room_people: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    }, {
        charset: "utf8",
        collate: "utf8_general_ci",
        timestamps: true,
    })
}
    
