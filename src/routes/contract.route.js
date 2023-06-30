const express = require("express");
const jwtAuth = require("../controllers/jwt.controller.js");
const { uploadFile, readContractFile, checkCertificateFile } = require("../controllers/contract.controller.js");

const router = express.Router();

router.post("/file/upload", jwtAuth, uploadFile);
router.post("/certificate/verify", jwtAuth, checkCertificateFile);
router.get("/file/read", jwtAuth, readContractFile);

module.exports = router;