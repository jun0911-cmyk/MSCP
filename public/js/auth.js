import metamask from "./modules/metamask.module.js";
import signup from "./modules/signup.module.js";
import auth from "./modules/auth.module.js";
import sign from "./modules/auth_sign.module.js";

const signupBtn = document.getElementById("signup_btn");
const authBtn = document.getElementById("auth_btn");
const metamaskGetBtn = document.getElementById("get_eth_btn");
const wallet_address = document.getElementById("wallet_address");
const down_cert_file = document.getElementById("down_cert_file");

sign.drawSign();

metamaskGetBtn.addEventListener("click", async () => {
  wallet_address.value = await metamask.accessAccountWallet();  
});

signupBtn.addEventListener("click", async () => {
    const walletAddress = wallet_address.value;

    const account_data = {
        username: document.getElementById("username").value,
        email: document.getElementById("useremail").value,
        name: document.getElementById("name").value,
        address: walletAddress,
        sign: JSON.stringify(sign.getSignData()),
    };

    await signup.postSignUp(account_data);
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
        console.log("auth failure");
    }
});

down_cert_file.addEventListener("click", () => {
    location.href = "/auth/certificate/download";
});