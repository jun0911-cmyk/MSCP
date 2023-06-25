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

const postAuth = async (auth_data) => {
    const response = await $.ajax({
        url: '/auth/verify',
        type: 'POST',
        data: JSON.stringify(auth_data),
        headers: {
            "Content-Type": "application/json"
        },
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
};