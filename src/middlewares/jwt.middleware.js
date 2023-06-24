const jwt = require("jsonwebtoken");
const logger = require("./log.middleware.js");

require("dotenv").config();

const signJWT = (payload) => {
    try {
        const env = process.env;

        return jwt.sign(payload, env.JWT_SECRET, {
            algorithm: "HS256",
            expiresIn: env.JWT_EXPIRES,
            issuer: env.JWT_ISSUER,
        });
    } catch (err) {
        logger("JWT Sign Error : " + err, "err");
        return null;
    }
}

const verifyJWT = (accessToken) => {
    try {
        const env = process.env;
        const decode_data = jwt.verify(accessToken, env.JWT_SECRET);
        return decode_data;
    } catch (err) {
        logger("JWT Verify Error : " + err, "err");

        if (err.message === "jwt expired") {
            return "expired";
        } else if (err.message === "invalid token") { 
            return "invalid";
        } else {
            return "invalid";
        }
    }
}

module.exports.sign = signJWT;
module.exports.verify = verifyJWT;