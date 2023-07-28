const express = require("express");
const { renderFile, authNonce, authVerify, authSignup, authLogOut, certificateHandle, testLogin, renderSignFile, authCheck } = require("../controllers/auth.controller.js");
const jwtAuth = require("../controllers/jwt.controller.js");

const router = express.Router();

router.get("/", renderFile);
router.get("/signup", renderSignFile);
router.get("/logout", authLogOut);
router.get("/certificate/download", jwtAuth, certificateHandle);
router.post("/nonce", authNonce);
router.post("/signup", authSignup);
router.post("/check", authCheck);
router.post("/test", testLogin);
router.post("/verify", authVerify);

module.exports = router;