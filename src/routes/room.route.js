const express = require("express");
const jwtAuth = require("../controllers/jwt.controller.js");
const { renderRoomPage, createRoom, roomList } = require("../controllers/room.controller.js");

const router = express.Router();

router.post("/create", jwtAuth, createRoom);
router.get("/list", jwtAuth, roomList);
router.get("/", jwtAuth, renderRoomPage);

module.exports = router;