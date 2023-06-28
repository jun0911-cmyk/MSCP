const contractFile = require("../services/contract.service.js");

module.exports.uploadFile = (req, res, next) => {
    if (req.upload.result == "success") {
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