const express = require("express");
const { renderFile, authNonce, authVerify, authSignup, authLogOut } = require("../controllers/auth.controller.js");

const router = express.Router();

router.get("/", renderFile);
router.get("/logout", authLogOut);
router.post("/nonce", authNonce);
router.post("/signup", authSignup);
router.post("/verify", authVerify);

module.exports = router;