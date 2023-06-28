import fileHandle from "./modules/file.module.js";

const file_upload_btn = document.getElementById("file_upload_btn");
const return_btn = document.getElementById("return_btn");
const next_btn = document.getElementById("next_btn");

let page = 1;

$("#return_btn").hide();
$("#next_btn").hide();

file_upload_btn.addEventListener("click", async () => {
    const file = document.getElementById("inputGroupFile02").files[0];
    const result = await fileHandle.file_upload(file);

    if (result == "success") {
        $("#return_btn").show();
        $("#next_btn").show();

        fileHandle.pdfView(page);
    } else {
        console.log("failure");
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