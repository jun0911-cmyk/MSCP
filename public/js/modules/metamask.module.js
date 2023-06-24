const checkMetaMaskExt = () => {
    if (window.ethereum == null) {
        return false;
    } else {
        return true;
    }
}

const accessAccountWallet = async () => {
    const isExt = checkMetaMaskExt();

    if (isExt) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        return accounts[0].toLowerCase();
    } else {
        console.log("plz add ext chrome to metamask");
    }
}

const signMetaMask = async (walletAddress, nonce) => {
    const message = `Sign MSCP Platform nonce : ${nonce}, [Meta Safe Contract Platform usage data. We will not recklessly copy or distribute that data]`

    const sign = await window.ethereum.request({ method: "personal_sign", params: [message, walletAddress] });

    return sign;
}

export default {
    accessAccountWallet,
    signMetaMask,
};