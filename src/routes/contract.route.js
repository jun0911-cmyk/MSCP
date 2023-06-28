const express = require("express");
const jwtAuth = require("../controllers/jwt.controller.js");
const multer = require("multer");
const path = require("path");
const logger = require("../middlewares/log.middleware.js");
const redis = require("../middlewares/redis.moddleware.js");
const { uploadFile, readContractFile } = require("../controllers/contract.controller.js");

const router = express.Router();
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        cb(null, path.join(__dirname, "../../contract_temp/"));
    },
    filename: async function (req, file, cb) {
        const idArr = req.id.split("-");
        const id = idArr[0] + idArr[1] + idArr[2] + idArr[3] + idArr[4];
        const filename = id + "_" + "contract" + "_" + file.originalname;

        await redis.set(id, file.originalname);

        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    try {
        if (file.mimetype !== "application/pdf") {
            req.upload = {
                result: "failure",
                message: "file filter catch",
            };
    
            return cb(null, false);
        }
    
        const filename = file.originalname;
        const ext = filename.split(".")[1];
        
        for (let filter of ["..", "../", "./", "/"]) {
            if (filename.includes(filter)) {
                req.upload = {
                    result: "failure",
                    message: "file filter catch",
                };

                return cb(null, false);
            }
        }
    
        if (ext !== "pdf") {
            req.upload = {
                result: "failure",
                message: "file filter catch",
            };
    
            return cb(null, false);
        }
    
        req.upload = {
            result: "success",
            message: "file upload success",
        };
    
        return cb(null, true);
    } catch (err) {
        logger("file upload error, err : " + err, "err");

        req.upload = {
            result: "failure",
            message: "file filter catch",
        };

        return cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: "1gb"
    },
});


router.post("/file/upload", jwtAuth, upload.single("contract_file"), uploadFile);
router.get("/file/read", jwtAuth, readContractFile);

module.exports = router;