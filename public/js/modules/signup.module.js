import loading from "./loading.module.js";

const postSignUp = async (account_data) => {
    const response = await $.ajax({
        url: '/auth/signup',
        type: 'POST',
        data: JSON.stringify(account_data),
        headers: {
            "Content-Type": "application/json"
        },
        beforeSend: loading.loadingMsg("회원가입 사용자 생성 및 NFT 사용자 고유 인증서를 발급중입니다."),
        complete: loading.completeLoading,
    });

    if (response.status == 200 & response.message == "signup ok") {
        return "success signup";
    } else {
        return response.message;
    }
};

export default {
    postSignUp,
};