const express = require("express");
const jwtAuth = require("../controllers/jwt.controller.js");
const { uploadFile, readContractFile, checkCertificateFile, signContract, signDownload, saveContractPDF, checkContractFile, ttsContract } = require("../controllers/contract.controller.js");

const router = express.Router();

router.post("/file/upload", jwtAuth, uploadFile);
router.post("/certificate/verify", jwtAuth, checkCertificateFile);
router.post("/file/verify", jwtAuth, checkContractFile);
router.post("/sign", jwtAuth, signContract);
router.post("/file/save", jwtAuth, saveContractPDF);
router.get("/speak/:page", jwtAuth, ttsContract);
router.get("/sign/download", jwtAuth, signDownload);
router.get("/file/read", jwtAuth, readContractFile);

module.exports = router;