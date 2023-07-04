const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const logging = require("./middlewares/log.middleware.js");
const fileUpload = require("express-fileupload");
const logger = require("morgan");

require("dotenv").config({ path: __dirname + "/config/.env" });
require("./config/sequelize.connect.js");

const app = express();
const port = process.env.PORT;

const authRouter = require("./routes/auth.route.js");
const indexRouter = require("./routes/index.route.js");
const contractRouter = require("./routes/contract.route.js");
const roomRouter = require("./routes/room.route.js");

app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use("/static/css", express.static("../public/css"));
app.use("/static/js", express.static("../public/js"));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(logger("dev"));

app.use("/contract", contractRouter);
app.use("/room", roomRouter);
app.use("/auth", authRouter);
app.use("/", indexRouter);

app.use((req, res, next) => {
    res.status(404);
});

app.listen(port, (err) => {
    if (err) return logging(err, "err");
    logging(`MSCP server running success http://localhost:${String(port)}`, "server");
})