const pdf = require("pdf-creator-node");
const fs = require("fs");
const utf8 = require("utf8");
const path = require("path");
const logger = require("./log.middleware.js");

class SignContract {
    constructor(contract_filename, organizer_name, participant_name, organizer_signData, participant_signData, organizer_id, participant_id) {
        this.contract_filename = contract_filename;
        this.organizer_name = organizer_name;
        this.participant_name = participant_name;
        this.organizer_signData = organizer_signData;
        this.participant_signData = participant_signData;
        this.organizer_id = organizer_id;
        this.participant_id = participant_id;
    }

    formatObject() {
        const date = new Date();

        const PDFFormatObj = {
            contract_filename: utf8.decode(this.contract_filename),
            organizer_name: this.organizer_name,
            participant_name: this.participant_name,
            date: String(date),
            organizer_signData: JSON.stringify(this.organizer_signData),
            participant_signData: JSON.stringify(this.participant_signData),
        };

        const options = {
            format: "A2",
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

    async createPDF() {
        const html = fs.readFileSync(path.join(__dirname, "../../public/views/contract_sign.html"), "utf8");
        const pdfFormat = this.formatObject();

        const document = {
            html: html,
            data: pdfFormat.PDFFormatObj,
            path: path.join(__dirname + "/../../certSign_temp/" + this.organizer_id + "_" + this.participant_id + "_" + "sign.pdf"),
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
            const filename = path.join(__dirname, "/../../certSign_temp/" + this.organizer_id + "_" + this.participant_id + "_" + "sign.pdf");
            const returnFilename = this.organizer_id + "_" + this.participant_id + "_" + "sign.pdf";
            
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

    async clearContractData() {
        try {
            const idArr = this.organizer_id.split("-");
            const id = idArr[0] + idArr[1] + idArr[2] + idArr[3] + idArr[4];
            const signFilePath = path.join(__dirname, "/../../certSign_temp/" + this.organizer_id + "_" + this.participant_id + "_" + "sign.pdf");
            const contractFilePath = path.join(__dirname, "/../../contract_temp/" + id + "_" + "contract" + "_" + this.contract_filename);

            if (fs.existsSync(signFilePath) && fs.existsSync(contractFilePath)) {
                fs.unlinkSync(signFilePath);
                fs.unlinkSync(contractFilePath);
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }
}

module.exports = SignContract;