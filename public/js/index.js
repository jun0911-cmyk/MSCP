import fileHandle from "./modules/file.module.js";

const file_upload_btn = document.getElementById("file_upload_btn");
const cert_verify_btn = document.getElementById("certificate_upload_btn");
const return_btn = document.getElementById("return_btn");
const next_btn = document.getElementById("next_btn");

let page = 1;

$("#return_btn").hide();
$("#next_btn").hide();

file_upload_btn.addEventListener("click", async () => {
    const file = document.getElementById("inputGroupFile02").files[0];
    const result = await fileHandle.file_upload(file,  "/contract/file/upload", "contract_file");

    if (result == "success") {
        console.log("file upload success");
    } else {
        console.log("failure");
    }
});

cert_verify_btn.addEventListener("click", async () => {
    const file = document.getElementById("inputGroupFile03").files[0];
    const result = await fileHandle.file_upload(file, "/contract/certificate/verify", "certificate_file");

    if (result.status == 200 && result.message == "Authed") {
        $("#return_btn").show();
        $("#next_btn").show();

        fileHandle.pdfView(page);
    } else {
        console.log("certificate file no cert");
    }
});

return_btn.addEventListener("click", () => {
    if (page > 1) {
        page = page - 1;
        fileHandle.pdfView(page);
    }
});

next_btn.addEventListener("click", () => {
    page = page + 1;
    fileHandle.pdfView(page);
});