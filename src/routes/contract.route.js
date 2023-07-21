const express = require("express");
const jwtAuth = require("../controllers/jwt.controller.js");
const { uploadFile, readContractFile, checkCertificateFile, signContract, signDownload, saveContractPDF } = require("../controllers/contract.controller.js");

const router = express.Router();

router.post("/file/upload", jwtAuth, uploadFile);
router.post("/certificate/verify", jwtAuth, checkCertificateFile);
router.post("/sign", jwtAuth, signContract);
router.post("/file/save", jwtAuth, saveContractPDF);
router.get("/sign/download", jwtAuth, signDownload);
router.get("/file/read", jwtAuth, readContractFile);

module.exports = router;