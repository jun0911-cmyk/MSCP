const path = require("path");
const Signup = require("../services/signup.service.js");
const { getNonce, Auth } = require("../services/auth.service.js");

module.exports.renderFile = (req, res, next) => {
    res.sendFile(path.join(__dirname + "/../../public/views/auth.html"));
}

module.exports.authNonce = async (req, res, next) => {
    const row = await getNonce(req.body.publicAddress);

    if (row == null) {
        return res.send({
            status: 401,
            message: "failure",
            nonce: null,
        }).status(401);
    }

    res.send({
        status: 200,
        message: "ok",
        nonce: row.dataValues.nonce,
    }).status(200);
};

module.exports.authSignup = async (req, res, next) => {
    const { username, email, name, address } = req.body;
    const signup = new Signup(username, email, name, address);

    if (signup.isNoneData()) {
        return res.send({
            status: 400,
            message: "is none data in account data"
        }).status(400);
    }

    const rowData = await signup.existRow();

    if (rowData != null) {
        return res.send({
            status: 400,
            message: "user is exists"
        }).status(400); 
    }

    await signup.createRow();

    res.send({
        status: 200,
        message: "signup ok"
    }).status(200);
},

module.exports.authVerify = async (req, res, next) => {
    const { publicAddress, signature } = req.body;
    const auth = new Auth(publicAddress, signature);

    if (auth.isNoneData()) {
        return res.send({
            status: 401,
            message: "is none data in auth data"
        }).status(401);
    }

    const authToken = await auth.checkAuth();

    if (authToken == null) {
        return res.send({
            status: 401,
            message: "user is not exists or auth failure"
        }).status(401); 
    } 

    else if (authToken) {
        res.cookie("accessToken", authToken, {
            maxAge: 1000 * 60 * 60 * 3,
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
        });

        return res.send({
            status: 200,
            message: "success",
        }).status(200); 
    }
}

module.exports.authLogOut = (req, res, next) => {
    res.clearCookie("accessToken");
    res.redirect("/auth");
}