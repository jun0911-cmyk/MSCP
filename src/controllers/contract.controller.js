const contractFile = require("../services/contract.service.js");
const redis = require("../middlewares/redis.moddleware.js");
const SignContract = require("../middlewares/sign.middleware.js");
const { getRoomFromUser } = require("../services/room.service.js");
const tts = require("../middlewares/tts.middleware.js");
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
        const canvasObj = JSON.parse(req.body.canvasData);
        const page = req.body.page;

        const pdfData = await contractFile.getPDFData(filename, page);

        if (commentObj == undefined || canvasObj == undefined || page == undefined || filename == null || pdfData == null) {
            return res.json({
                status: 400,
                message: "failure pdf fix"
            }).status(400);
        }

        for (let i = 0; i < commentObj.length; i++) {
            const comment = commentObj[i];

            const offsetX = comment.offsetX.split("pt")[0];
            const offsetY = comment.offsetY.split("pt")[0];

            const x = comment.x * 0.75;
            const y = offsetY - (comment.y * 0.75);

            pdfData.pdfPage.moveTo(x - 5, y - 10);
            pdfData.pdfPage.drawText(comment.text, {
                font: pdfData.fontByte,
                size: 12,
            });
        }

        for (let j = 0; j < canvasObj.length; j++) {
            const canvas = canvasObj[j];
            
            const array = JSON.parse(canvas.blob);
            const typedArray = Uint8Array.from(array);
            const arrayBuffer = typedArray.buffer;

            const offsetX = canvas.offsetX.split("pt")[0];
            const offsetY = canvas.offsetY.split("pt")[0];

            const x = canvas.x * 0.75;
            const y = offsetY - (canvas.y * 0.75);

            const canvasImage = await pdfData.document.embedPng(arrayBuffer);
            const imageDims = canvasImage.scale(1);

            pdfData.pdfPage.drawImage(canvasImage, {
                x: x - 5,
                y: y - 50,
                width: imageDims.width,
                height: imageDims.height,
            });
        }

        fs.writeFileSync(pdfData.filepath, await pdfData.document.save());

        return res.json({
            status: 200
        }).status(200);

    } catch (err) {
        console.log(err);
        return res.json({
            status: 400,
            message: "failure pdf fix"
        }).status(400);
    }
} 

module.exports.checkContractFile = async (req, res, next) => {
    if (req.files.contract_file) {
        const basePDFname = await contractFile.getFilename(req.id);
        const targetPDF = req.files.contract_file;

        const baseData = contractFile.convertPDF2Base64(basePDFname);
        const targetData = targetPDF.data.toString("base64");

        const authKey = req.id + "_authed";
        const isKey = await contractFile.isCheckRedisKey(authKey);

        if (baseData == null) {
            if (isKey) {
                await redis.del(authKey);
            }

            return res.json({
                status: 401,
                message: "Permission Denined",
            }).status(401);   
        }

        if (baseData === targetData) {
            return res.json({
                status: 200,
                message: "Authed",
            }).status(200);
        } else {
            if (isKey) {
                await redis.del(authKey);
            }

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

module.exports.ttsContract = async (req, res, next) => {
    if (req.params.page) {
        const pdf_page = req.params.page;
        const contract_filename = await contractFile.getFilename(req.id);

        if (pdf_page == 0) {
            let fail_audio = await tts.getSpeech("계약서가 아직 로딩되지 않았습니다. 룸안에 참가자를 확인하신 후 계약 시작 버튼을 누르신 다음, 해당 버튼을 다시 눌러주세요.");

            res.setHeader("Content-Type", "audio/mpeg");
            res.send(fail_audio).status(200);

            return;
        }

        const text = await contractFile.convertPDF2TEXT(contract_filename, pdf_page);

        if (text != null) {
            const sentences = text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|!)\s/g);
            const split_text = sentences.filter(sentence => sentence.trim() !== '');
            
            let text_data = "";
            let text_array = [];
            let audioData_array = [];
            let audioData = "";

            text_array.push("계약서의 " + String(pdf_page) + "쪽 음성 읽기를 시작합니다.");

            for (let i=0; i < split_text.length; i++) {
                if (i % 5 == 0) {
                    text_array.push(text_data);
                    text_data = "";
                }

                text_data += split_text[i];
            }

            text_array.push(text_data);
            text_array.push("계약서의 " + String(pdf_page) + "쪽 음성 읽기가 끝났습니다. 다음 페이지 읽기를 요청하시려면 페이지를 넘기신 후 버튼을 눌러주시기 바랍니다.");

            for (let j=0; j < text_array.length; j++) {
                audioData_array.push(await tts.getSpeech(text_array[j]));
            }

            audioData = Buffer.concat(audioData_array);

            res.setHeader("Content-Type", "audio/mpeg");
            res.send(audioData).status(200);
        } else {
            return res.send(null).status(400);
        }
    }
}