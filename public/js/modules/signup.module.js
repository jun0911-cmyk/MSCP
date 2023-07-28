const postSignUp = async (account_data) => {
    const response = await $.ajax({
        url: '/auth/signup',
        type: 'POST',
        data: JSON.stringify(account_data),
        headers: {
            "Content-Type": "application/json"
        },
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