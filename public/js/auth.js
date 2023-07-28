import metamask from "./modules/metamask.module.js";
import auth from "./modules/auth.module.js";
import sign from "./modules/auth_sign.module.js";

const authBtn = document.getElementById("auth_btn");
const test_login_btn = document.getElementById("test_auth_btn");

sign.drawSign();

test_login_btn.addEventListener("click", async () => {
    const test_username = document.getElementById("test_username").value;

    const result = await auth.postTestLogin({
        username: test_username,
        sign: JSON.stringify(sign.getSignData()),
    });

    if (result == "success") {
        location.href = "/";
    } else {
        document.getElementById("fail_message").innerText = "서비스 로그인에 실패하였습니다, 공백란이 존재하는지 확인하시고 다시 시도해주세요.";
    }
});

authBtn.addEventListener("click", async () => {
    const metamaskAddress = await metamask.accessAccountWallet();
    const nonce = await auth.postGetNonce({
        publicAddress: metamaskAddress
    });

    const signData = await metamask.signMetaMask(metamaskAddress, nonce);
    const result = await auth.postAuth({
        publicAddress: metamaskAddress,
        signature: signData,
    });

    if (result == "success") {
        location.href = "/";
    } else {
        document.getElementById("fail_message").innerText = "서비스 로그인에 실패하였습니다, 공백란이 존재하는지 확인하시고 다시 시도해주세요.";
    }
});

//down_cert_file.addEventListener("click", () => {
//    location.href = "/auth/certificate/download";
//});