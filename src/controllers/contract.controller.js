module.exports.uploadFile = (req, res, next) => {
    if (req.upload.result == "success") {
        res.json({
            status: 200,
            message: "success",
        }).status(200);
    } else {
        res.json({
            status: 400,
            message: "file upload failure",
        }).status(400);
    }
}