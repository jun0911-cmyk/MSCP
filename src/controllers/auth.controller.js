const path = require("path");
const Signup = require("../services/signup.service.js");
const { getNonce, Auth, updateCertDownload } = require("../services/auth.service.js");
const Certification = require("../middlewares/certificate.middleware.js");
const uuidv4 = require("uuid4");

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
    const { username, email, name, address, sign } = req.body;
    const id = uuidv4();
    const signup = new Signup(id, username, email, name, address);
    const certification = new Certification(id, username, name, email, sign);

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

    const pdfRes = await certification.createPDF();
    
    if (pdfRes) {
        await signup.createRow();

        res.send({
            status: 200,
            message: "signup ok"
        }).status(200);
    }
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

module.exports.certificateHandle = async (req, res, next) => {
    try {
        const id = req.id;
        const certificate = new Certification(id, null, null, null);
        const auth = new Auth(req.publicAddress, null);
        const user = await auth.getUser();
        const fileObj = await certificate.getPDF();

        if (fileObj && !user.dataValues.cert_file_download) {
            await updateCertDownload(id);

            res.setHeader('Content-Length', fileObj.stat.size);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=' + fileObj.returnFilename);

            fileObj.file.pipe(res);

            certificate.removePDF();
        } else {
            res.send("no").status(400);
        }
    } catch (err) {
        res.send("no").status(400);
    }
}