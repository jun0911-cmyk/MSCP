import fileHandle from "./modules/file.module.js";
import signHandle from "./modules/sign.module.js";

const return_btn = document.getElementById("return_btn");
const next_btn = document.getElementById("next_btn");
const sign_btn = document.getElementById("sign_contract_btn");
const socket = io("http://localhost:9000/room/contract", { transports : ['websocket'], path: "/socket.io" });

let page = 1;

$("#return_btn").hide();
$("#next_btn").hide();

/*
cert_verify_btn.addEventListener("click", async () => {
    const file = document.getElementById("inputGroupFile03").files[0];
    const result = await fileHandle.file_upload(file, "/contract/certificate/verify", "certificate_file");

    if (result.message == "Authed") {
        $("#return_btn").show();
        $("#next_btn").show();

        fileHandle.pdfView(page);
    } else {
        console.log("certificate file no cert");
    }
});
*/

sign_btn.addEventListener("click", () => {
    document.getElementById("sign_container").innerHTML = `
        <h3>Your Signature Sign</h3>
        <canvas id="canvas" width="250" height="80"></canvas>
        <div class="sign_btn_class">
            <button id="redraw">Redraw Sign</button>
            <button id="save">Sign Ok</button>
        </div>
        `;

    signHandle.drawSign();
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