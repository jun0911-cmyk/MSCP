const express = require("express");
const jwtAuth = require("../controllers/jwt.controller.js");
const path = require("path");
const { createRoom, roomList, joinRoom, renderRoomPage } = require("../controllers/room.controller.js");

const router = express.Router();

router.post("/create", jwtAuth, createRoom);
router.get("/join/:oww_username", jwtAuth, joinRoom);
router.get("/list", jwtAuth, roomList);
router.get("/", jwtAuth, renderRoomPage);

module.exports = router;