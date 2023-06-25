const JWT  = require("../middlewares/jwt.middleware.js");
const logger = require("../middlewares/log.middleware.js");
const { Auth } = require("../services/auth.service.js");

const settingReqObj = (req, dbUser) => {
    try {
        const user = dbUser.dataValues;

        for (let key of ["id", "username", "email", "name", "publicAddress"]) {
            req[key] = user[key];
        }
        
        return "success";
    } catch {
        logger("JWT Req Object Setting Error : " + err, "err");
        return null;
    }
}


const jwtAuth = async (req, res, next) => {
    if (req.cookies.accessToken) {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.redirect("/auth");
        };

        const payload = JWT.verify(accessToken);

        if (payload == "expired" || payload == "invalid" || payload == null) {
            return res.redirect("/auth");
        } else {
            const auth = new Auth(payload.publicAddress, null);
            const row = await auth.getUser();

            if (row == null) {
                logger("user findOne Error or user not found", "err");
                return res.redirect("/auth");
            }

            settingReqObj(req, row);

            next();
        };
    } else {
        return res.redirect("/auth");
    }
}

module.exports = jwtAuth;