const express = require("express");
const { renderFile, authUser, authVerify, authSignup } = require("../controllers/auth.controller.js");

const router = express.Router();

router.get("/", renderFile);
router.post("/", authUser);
router.post("/signup", authSignup);
router.post("/verify", authVerify);

module.exports = router;