import fileHandle from "./modules/file.module.js";

const file_upload_btn = document.getElementById("file_upload_btn");

file_upload_btn.addEventListener("click", async () => {
    const file = document.getElementById("inputGroupFile02").files[0];
    const result = await fileHandle.file_upload(file);

    if (result == "success") {
        console.log("success");
    } else {
        console.log("failure");
    }
});