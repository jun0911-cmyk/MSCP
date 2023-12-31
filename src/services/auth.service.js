const models = require("../models");
const logger = require("../middlewares/log.middleware.js");
const JWT = require("../middlewares/jwt.middleware.js");
const { bufferToHex } = require("ethereumjs-util");
const { recoverPersonalSignature } = require("eth-sig-util");

class Auth {
    constructor(publicAddress, signature) {
        this.publicAddress = publicAddress;
        this.signature = signature;
    }

    isNoneData() {
        for (let key of ["publicAddress", "signature"]) {
            if (this[key] == null) {
                return true;
            }
        }

        return false;
    }

    async getUser() {
        try {
            return await models.user.findOne({
                where: {
                    publicAddress: this.publicAddress,
                }
            });
        } catch (err) {
            logger("sequelize findONe error : " + err, "err");
            return null;
        }
    }

    async checkAuth() {
        const row = await this.getUser();

        if (row == null) {
            return null;
        }

        const message = `Sign MSCP Platform nonce : ${row.dataValues.nonce}, [Meta Safe Contract Platform usage data. We will not recklessly copy or distribute that data]`;

        const msgBufferHex = bufferToHex(Buffer.from(message, "utf8"));
        const address = recoverPersonalSignature({
            data: msgBufferHex,
            sig: this.signature,
        });

        if (address.toLowerCase() === this.publicAddress.toLowerCase()) {
            const payload = {
                id: row.dataValues.id,
                username: row.dataValues.username,
                publicAddress: row.dataValues.publicAddress,
            };

            return JWT.sign(payload);
        } else {
            return null;
        }
    }
}

const getNonce = async (publicAddress) => {
    try {
        if (publicAddress == "" || publicAddress == null || publicAddress == undefined) {
            return null;
        };
    
        return await models.user.findOne({
            where: {
                publicAddress: publicAddress
            }
        });
    } catch (err) {
        logger("sequelize findOne error : " + err, "err");
        return null;
    }
}

const updateCertDownload = async (id) => {
    try {
        return models.user.update(
            { cert_file_download: true }, 
            { where: { id: id } },
        );
    } catch (err) {
        logger("sequelize update error : " + err, "err");
        return null;
    }
}

const getTestToken = async (username) => {
    try {
        const userData = await models.user.findOne({
            where: {
                username: username,
            }
        });

        if (userData == null) {
            return null;
        }

        const payload = {
            id: userData.dataValues.id,
            username: userData.dataValues.username,
            publicAddress: userData.dataValues.publicAddress,
        };

        const accessToken = JWT.sign(payload);
        const user = userData.dataValues

        return {
            accessToken,
            user,
        };
    } catch (err) {
        return null;
    }
}

module.exports.updateCertDownload = updateCertDownload;
module.exports.getNonce = getNonce;
module.exports.getTestToken = getTestToken;
module.exports.Auth = Auth;