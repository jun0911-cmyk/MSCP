const loadingMsg = (msg) => {
    return function(xhr) {
        const loadingContainer = document.getElementById("loading_bar");

        loadingContainer.innerHTML = `
        <style>
        .loading-container {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            width: 20rem;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 5px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            opacity: 0;
            animation: fadeIn 1s forwards; 
        }

        .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 2s linear infinite;
            margin: 0 auto 20px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .loading-text {
            font-size: 18px;
            color: #555;
        }

        @keyframes fadeIn {
            to {
                opacity: 1;
            }
        }
        </style>

        <div class="loading-container">
            <div class="loader"></div>
            <p class="loading-text">${msg}</p>
        </div>
        `
    }
}

const completeLoading = () => {
    const loadingEle = document.getElementById("loading_bar");

    if (loadingEle) {
        loadingEle.innerHTML = "";
    }
}

export default {
    completeLoading,
    loadingMsg,
}