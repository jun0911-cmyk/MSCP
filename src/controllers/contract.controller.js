const contractFile = require("../services/contract.service.js");
const redis = require("../middlewares/redis.moddleware.js");

module.exports.uploadFile = async (req, res, next) => {
    const isCreated = await contractFile.createPDF(req);

    if (isCreated) {
        res.json({
            status: 200,
            message: "success",
        }).status(200);
    } else {
        res.json({
            status: 400,
            message: "file upload failure",
        }).status(400);
    }
}

module.exports.readContractFile = async (req, res, next) => {
    const filename = await contractFile.getFilename(req.id);

    if (filename !== null) {
        const fileData = contractFile.getFile(filename);

        if (fileData == null) { 
            return res.json({
                status: 500,
                message: "server error",
            }).status(500);
        }

        res.contentType("application/pdf");
        res.send(fileData).status(200);
    } else {
        res.json({
            status: 400,
            message: "file not uploaded",
        }).status(400);
    }
}

module.exports.checkCertificateFile = async (req, res, next) => {
    if (req.files.certificate_file) {
        const certificateData = await contractFile.convertPDF2JSON(req.files.certificate_file);
        
        if (certificateData === null) {
            return res.json({
                status: 401,
                message: "Permission Denined",
            }).status(401);
        }

        if (req.id === certificateData.id && req.username === certificateData.username) {
            if (contractFile.isSafeCert(req.id, certificateData
                .id)) {
                    await redis.set(certificateData.id + "_authed", "accessTo_" + certificateData.id);

                    return res.json({
                        status: 200,
                        message: "Authed",
                    }).status(200);
                } else {
                    return res.json({
                        status: 401,
                        message: "Permission Denined",
                    }).status(401);
                }
        } else {
            return res.json({
                status: 401,
                message: "Permission Denined",
            }).status(401);
        }
    } else {
        return res.json({
            status: 401,
            message: "Permission Denined",
        }).status(401);
    }
}