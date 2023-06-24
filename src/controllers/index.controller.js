const path = require("path");

module.exports.renderFile = (req, res, next) => {
    res.sendFile(path.join(__dirname + "/../../public/views/index.html"));
}