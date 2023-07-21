const contractFile = require("../services/contract.service.js");
const redis = require("../middlewares/redis.moddleware.js");
const SignContract = require("../middlewares/sign.middleware.js");
const { getRoomFromUser } = require("../services/room.service.js");
const fs = require("fs");

let checkSignRequest = {};

const createSignJSON = (roomName, organizer_id, participant_id, req, signData) => {
    if (checkSignRequest[roomName] == undefined) {
        checkSignRequest[roomName] = [];
    }

    if (organizer_id == req.id) {
        checkSignRequest[roomName].push({
            id: req.id,
            signData: JSON.stringify(signData),
            user: {
                id: req.id,
                username: req.username,
                name: req.name,
                email: req.email,
            },
            role: "organizer",
        });
    } else if (participant_id == req.id) {
        checkSignRequest[roomName].push({
            id: req.id,
            signData: JSON.stringify(signData),
            user: {
                id: req.id,
                username: req.username,
                name: req.name,
                email: req.email,
            },
            role: "participant",
        });
    }

    return true;
}

const concatJSON = (target, roomName) => {
    for (let i = 0; i <= 1; i++) {
        target[checkSignRequest[roomName][i].role] = checkSignRequest[roomName][i];
    }

    return true;
}

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

module.exports.signContract = async (req, res, next) => {
    const signData = JSON.parse(req.body.sign);
    const id = req.id;
    const filename = await contractFile.getFilename(id);
    const roomData = await getRoomFromUser(id);

    let roomRoleUser = {};

    if (roomData == null) {
        return res.json({
            status: 400,
            message: "sign failure",
        }).status(400);
    }

    const roomName = roomData.dataValues.room_name;
    const isAppended = createSignJSON(roomName, roomData.dataValues.organizer_id, roomData.dataValues.participant_id, req, signData);

    if (isAppended) {
        if (filename && checkSignRequest[roomName].length == 2) {
            concatJSON(roomRoleUser, roomName);

            const organizerUser = roomRoleUser["organizer"].user;
            const participantUser = roomRoleUser["participant"].user;
            const signContract = new SignContract(
                filename,
                organizerUser.name, 
                participantUser.name, 
                roomRoleUser["organizer"].signData, 
                roomRoleUser["participant"].signData, 
                organizerUser.id, 
                participantUser.id
            );

            const createSign = await signContract.createPDF();

            if (createSign) {
                await redis.set(organizerUser.id + "_signFile", createSign);
                await redis.set(organizerUser.id + "_signed", 1);
                await redis.set(participantUser.id + "_signed", 1);

                roomRoleUser = [];
                checkSignRequest[roomName] = undefined;

                return res.json({
                    status: 200,
                    message: "success sign",
                }).status(200);
            } else { 
                return res.json({
                    status: 400,
                    message: "sign failure",
                }).status(400);
            }
        } else {
            return res.json({
                status: 400,
                message: "panding",
            }).status(400);
        }
    } else {
        return res.json({
            status: 400,
            message: "sign failure",
        }).status(400);
    }
}

module.exports.signDownload = async (req, res, next) => {
    try {
        const signer_id = await redis.get(req.id + "_signed");
        const filename = await contractFile.getFilename(req.id, "_signFile");
        
        if (signer_id && filename) {
            const originalFilename = filename;
            const signContract = new SignContract(originalFilename, null, null, null, null, null, null);
            const signFile = await signContract.getPDF();
            
            res.setHeader('Content-Length', signFile.stat.size);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=' + signFile.returnFilename);

            signFile.file.pipe(res);
        } else {
            return res.json({
                status: 400,
                message: "no signed contract file",
            }).status(400);
        }
    } catch (err) {
        return res.json({
            status: 400,
            message: "no signed contract file",
        }).status(400);
    }
}

module.exports.saveContractPDF = async (req, res, next) => {
    try {
        const filename = await contractFile.getFilename(req.id);
        const commentObj = JSON.parse(req.body.commentData);
        const page = req.body.page;

        const pdfData = await contractFile.getPDFData(filename, page);

        if (commentObj == undefined || page == undefined || filename == null || pdfData == null) {
            return res.json({
                status: 400,
                message: "failure pdf fix"
            }).status(400);
        }

        for (let i = 0; i < commentObj.length; i++) {
            const comment = commentObj[i];

            const offsetX = comment.offsetX.split("pt")[0];
            const offsetY = comment.offsetY.split("pt")[0];

            const x = comment.x * 0.7;
            const y = offsetY - (comment.y * 0.75);

            pdfData.pdfPage.moveTo(x + 20, y - 15);
            pdfData.pdfPage.drawText(comment.text, {
                font: pdfData.fontByte,
                size: 12,
            });
        }

        fs.writeFileSync(pdfData.filepath, await pdfData.document.save());

        return res.json({
            status: 200
        }).status(200);

    } catch (err) {
        return res.json({
            status: 400,
            message: "failure pdf fix"
        }).status(400);
    }
} 