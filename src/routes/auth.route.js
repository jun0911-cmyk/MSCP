const express = require("express");
const { renderFile, authNonce, authVerify, authSignup, authLogOut, certificateHandle, testLogin } = require("../controllers/auth.controller.js");
const jwtAuth = require("../controllers/jwt.controller.js");

const router = express.Router();

router.get("/", renderFile);
router.get("/logout", authLogOut);
router.get("/certificate/download", jwtAuth, certificateHandle);
router.post("/nonce", authNonce);
router.post("/signup", authSignup);
router.post("/test", testLogin);
router.post("/verify", authVerify);

module.exports = router;