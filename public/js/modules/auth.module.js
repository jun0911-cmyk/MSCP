import loading from "./loading.module.js";

const postGetNonce = async (auth_data) => {
    const response = await $.ajax({
        url: '/auth/nonce',
        type: 'POST',
        data: JSON.stringify(auth_data),
        headers: {
            "Content-Type": "application/json"
        },
    });

    if (response.status == 200 & response.message == "ok") {
        return response.nonce;
    } else {
        return null;
    }
};

const postTestLogin = async (auth_data) => {
    const response = await $.ajax({
        url: '/auth/test',
        type: 'POST',
        data: JSON.stringify(auth_data),
        headers: {
            "Content-Type": "application/json"
        },
        beforeSend: loading.loadingMsg("로그인 확인 및 NFT 사용자 고유 인증서를 발급중입니다."),
        complete: loading.completeLoading,
    });

    if (response.status == 200 & response.message == "success") {
        return "success";
    } else {
        return null;
    }
};

const postAuth = async (auth_data) => {
    const response = await $.ajax({
        url: '/auth/verify',
        type: 'POST',
        data: JSON.stringify(auth_data),
        headers: {
            "Content-Type": "application/json"
        },
        beforeSend: loading.loadingMsg("로그인 확인중입니다."),
        complete: loading.completeLoading,
    });

    if (response.status == 200 & response.message == "success") {
        return "success";
    } else {
        return null;
    }
};


export default {
    postGetNonce,
    postAuth,
    postTestLogin,
};