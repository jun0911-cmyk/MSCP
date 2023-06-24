module.exports = (sequelize, DataTypes) => {
    return sequelize.define("user", {
        id: {
            type: DataTypes.STRING(36),
            allowNull: false,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        nonce: {
            type: DataTypes.STRING(32),
            allowNull: false,
            unique: true,
        },
        publicAddress: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        cert_file_address: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: "no_cert",
        }
    }, {
        charset: "utf8",
        collate: "utf8_general_ci",
        timestamps: true,
    })
}
    
