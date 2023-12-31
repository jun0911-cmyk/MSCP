const models = require("../models");
const { Op }  = require("sequelize");
const logger = require("../middlewares/log.middleware.js");
const crypto = require("crypto");

const generateRandomString = (length) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
  
    while (randomString.length < length) {
      const randomBytes = crypto.randomBytes(length);
      const buffer = Buffer.from(randomBytes);
  
      for (let i = 0; i < buffer.length; i++) {
        const randomIndex = buffer[i] % charset.length;
        randomString += charset[randomIndex];
      }
    }
  
    return randomString;
};

class Signup {
    constructor(id, username, email, name, publicAddress) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.name = name;
        this.publicAddress = publicAddress;
    }

    isNoneData() {
        for (let key of ["username", "email", "name", "publicAddress"]) {
            if (this[key] == "") {
                return true;
            }
        }

        return false;
    }

    async existRow() {
        try {
            return await models.user.findOne({
                where: {
                    [Op.or]: [
                        {
                            publicAddress: this.publicAddress
                        },
                        {
                            username: this.username
                        }
                    ]
                }
            });
        } catch (err) {
            logger("sequelize findOne error : " + err, "err");
            return null;
        }
    }

    async createRow() {
        try {
            return await models.user.create({
                id: this.id,
                username: this.username,
                email: this.email,
                name: this.name,
                nonce: generateRandomString(16),
                publicAddress: this.publicAddress,
            });
        } catch (err) {
            logger("sequelize insert error : " + err, "err");
            return null;
        }
    }
}

module.exports = Signup;