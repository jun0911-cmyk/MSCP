import metamask from "./modules/metamask.module.js";
import signup from "./modules/signup.module.js";
import sign from "./modules/auth_sign.module.js";

const signupBtn = document.getElementById("signup_btn");
const metamaskGetBtn = document.getElementById("get_eth_btn");
const wallet_address = document.getElementById("wallet_address");

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

    const result = await signup.postSignUp(account_data);

    if (result == "user is exists") {
        document.getElementById("fail_message").innerText = "서비스 로그인에 실패하였습니다, 이미 동일한 ID의 사용자가 존재합니다.";
    } else if (result == "success signup") {
        location.href = "/";  
    } else {
        document.getElementById("fail_message").innerText = "서비스 로그인에 실패하였습니다, 공백란이 존재하는지 확인하시고 다시 시도해주세요.";
    }
});