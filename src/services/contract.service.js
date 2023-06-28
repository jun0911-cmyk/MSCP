const fs = require("fs");
const path = require("path");
const redis = require("../middlewares/redis.moddleware.js");
const logger = require("../middlewares/log.middleware.js");

const getFilename = async (user_id) => {
    const id = user_id.split("-");
    let file_id = "";

    for (let i = 0; i <= 4; i++) {
        file_id += id[i];
    }

    const originalFilename = await redis.get(file_id);

    if (originalFilename) {
        const file_name = file_id + "_" + "contract" + "_" + originalFilename;
        return file_name;
    } else {
        return null;
    }   
}

const getFile = (filename) => {
    try {
        const allFilename = path.join(__dirname, "../../contract_temp/" + filename);
        const file = fs.readFileSync(allFilename);

        return file;
    } catch (err) {
        logger("file read error :" + err, "err");
        return null;
    }
}

module.exports.getFilename = getFilename;
module.exports.getFile = getFile;