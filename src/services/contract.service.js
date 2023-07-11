const fs = require("fs");
const path = require("path");
const models = require("../models");
const redis = require("../middlewares/redis.moddleware.js");
const logger = require("../middlewares/log.middleware.js");
const { getRoomFromUser } = require("./room.service.js");
const utf8 = require("utf8");
const pdfParser = require("pdf-parse");

const fileFilter = (req) => {
    try {
        if (req.files.contract_file.mimetype !== "application/pdf") {
            return false;
        }
    
        const filename = req.files.contract_file.name;
        const ext = filename.split(".")[1];
        const chFilename = filename.split(".")[0];
        
        for (let filter of ["..", "../", "./", "/"]) {
            if (filename.includes(filter)) {
                return false;
            }
        }
    
        if (ext !== "pdf") {
            return false;
        }

        if (chFilename.indexOf("_") != -1) {
            return false;
        }
    
        return true;
    } catch (err) {
        logger("file upload error, err : " + err, "err");

        return false;
    }
}

const createFilename = async (req) => {
    if (fileFilter(req)) {
        const idArr = req.id.split("-");
        const id = idArr[0] + idArr[1] + idArr[2] + idArr[3] + idArr[4];
        const filename = id + "_" + "contract" + "_" + req.files.contract_file.name;

        await redis.set(id, filename);

        return filename;
    } else {
        return null;
    }
}

const createPDF = async (req) => {
    try {
        const data = req.files.contract_file.data;
        const filename = await createFilename(req);

        if (filename === null) {
            return false;
        }

        fs.writeFileSync(path.join(__dirname, "../../contract_temp/" + filename), data);

        return true;
    } catch (err) {
        logger("file write error : " + err, "err");
        return false;
    }
}


const getFilename = async (user_id) => {
    try {
        const certAuth = await redis.get(user_id + "_authed");
        const certID = certAuth.split("_")[1].split("-");

        let file_id = "";

        for (let i = 0; i <= 4; i++) {
            file_id += certID[i];
        }

        const roomData = await getRoomFromUser(certID);

        if (roomData == null) {
            return null;
        }

        const filename = await redis.get(roomData.dataValues.organizer_id);

        if (filename) {
            return filename;
        } else {
            return null;
        }   
    } catch (err) {
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

const convertPDF2JSON = async (file) => {
    try {
        const pdf = await pdfParser(file.data);

        const id = pdf.text.split(":")[1].split("\n")[0].trim();
        const username = pdf.text.split(":")[2].split("\n")[0].trim();

        return {
            id, username
        };
    } catch (err) {
        logger("PDF Parsing Error : " + err, "err");
        return null;
    }
}

const getUserData = async (client_id) => {
    try {
        return await models.user.findOne({
            where: {
                id: client_id
            }
        });
    } catch (err) {
        logger("Sequelize findOne Error : " + err, "err");
        return null;
    }
}

const isSafeCert = async (client_id, cert_id) => {
    const user = await getUserData(client_id);

    if (user === null) {
        return false;
    }

    const user_id = user.dataValues.id;

    if (user_id == cert_id) {
        return true;
    } else {
        return false;
    }
}

const checkRedisData = async (id) => {
    const idArr = id.split("-");
    const file_id = idArr[0] + idArr[1] + idArr[2] + idArr[3] + idArr[4];

    try {
        const contract_filename = await redis.get(file_id);
        const certificate_access = await redis.get(id + "_authed");

        if (contract_filename && certificate_access) {
            const check_id = certificate_access.split("_")[1].split("-");
            const generate_cert_id = check_id[0] + check_id[1] + check_id[2] + check_id[3] + check_id[4];
            const filename_id = contract_filename.split("_")[0];
            const filename = contract_filename.split("_")[2].split(".")[0];

            return generate_cert_id === filename_id ? Buffer.from(filename, 'utf-8').toString() : null;
        } else {
            return null;
        }
    } catch (err) {
        return null;
    }
}

module.exports.checkRedisData = checkRedisData;
module.exports.createPDF = createPDF;
module.exports.isSafeCert = isSafeCert;
module.exports.convertPDF2JSON = convertPDF2JSON;
module.exports.getFilename = getFilename;
module.exports.getFile = getFile;