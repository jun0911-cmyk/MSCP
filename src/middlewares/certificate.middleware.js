const pdf = require("pdf-creator-node");
const fs = require("fs");
const path = require("path");
const logger = require("./log.middleware.js");

class Certification {
    constructor(id, username, name, email) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.email = email;
    }

    formatObject() {
        const date = new Date();
        const PDFFormatObj = {
            id: this.id,
            username: this.username,
            name: this.name,
            email: this.email,
            date: String(date),
            sign: "test",
        };

        const options = {
            format: "A3",
            width: "26cm",
            height: "33cm",
            orientation: "portrait",
            border: "10mm",
        }

        return {
            PDFFormatObj,
            options,
        };
    }

    getUserIDGenerate() {
        const id = this.id.split("-");
        let file_id = "";

        for (let i = 0; i <= 4; i++) {
            file_id += id[i];
        }

        return file_id;
    }

    async createPDF() {
        const html = fs.readFileSync(path.join(__dirname, "../../public/views/cert.html"), "utf8");
        const pdfFormat = this.formatObject();
        const file_id = this.getUserIDGenerate();

        const document = {
            html: html,
            data: pdfFormat.PDFFormatObj,
            path: path.join(__dirname + "/../../certificate_temp/" + file_id + "_" + "certificate.pdf"),
            type: "",
        };

        return pdf.create(document, pdfFormat.options).then((res) => {
            return true;
        }).catch((err) => {
            logger("PDF Create Error : " + err, "err");
            return null;
        });
    }

    async getPDF() {
        try {
            const file_id = this.getUserIDGenerate();
            const filename = path.join(__dirname, "/../../certificate_temp/" + file_id + "_" + "certificate.pdf");
            const returnFilename = file_id + "_" + "certificate.pdf";
            
            if (fs.existsSync(filename)) {
                const file = fs.createReadStream(filename);
                const stat = fs.statSync(filename);

                return {
                    file, stat, returnFilename,
                };
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

    async removePDF() {
        try {
            const file_id = this.getUserIDGenerate();
            const filepath = path.join(__dirname, "/../../certificate_temp/" + file_id + "_" + "certificate.pdf");

            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }
}

module.exports = Certification;