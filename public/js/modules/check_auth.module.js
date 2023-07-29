const nav_content = document.getElementById("nav_container");

const certCheck = async () => {
    return await $.ajax({
        url: '/auth/certificate/check',
        type: 'GET',
    });
}

const certMessage = () => {
    Swal.fire({
        title: '사용자 인증서를 다운로드 하시겠습니까?',
        html: "- 다운받은 NFT 인증서를 '꼭' PC의 중요폴더에 보관해주세요.</br></br>- 해당 인증서는 계약룸에 입장시 계약자 식별 및 인증용도로 중요하게 사용됩니다.</br></br>-해당 인증서는 분실시 재발급이 불가능하며 계정당 1회 최초발급만 가능합니다.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '인증서 다운로드',
        cancelButtonText: "취소"
    }).then(async (result) => {
        if (result.isConfirmed) {
          const response = await certCheck();

          if (response == "ok") {
            const downloadLink = document.createElement('a');
            downloadLink.href = "/auth/certificate/download";
            downloadLink.download = "certificate.pdf";
            
            downloadLink.click();

            URL.revokeObjectURL(downloadLink.href);
          } else {
            Swal.fire({
                icon: 'error',
                title: '인증서를 다운로드하지 못하였습니다.',
                text: '문제가 발생했거나, 이미 인증서를 다운받으셨습니다.',
                footer: '<a href="">인증서를 분실하였습니다.</a>'
            });
          }
        }
    });
}

async function checkAuth() {
    return await $.ajax({
        url: '/auth/check',
        type: 'POST',
    });
}

if (nav_content) {
    const result = await checkAuth();

    if (result.isLogin) {
        nav_content.innerHTML = `
        <nav class="navbar navbar-expand-lg bg-body-tertiary" style="box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
            <div class="container-fluid">
                <a class="navbar-brand" href="/">Meta Safe Contract Platform</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarText">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="#">소개</a>
                    </li>
                    <li class="nav-item">
                    <a class="nav-link" href="/room">계약 참가</a>
                    </li>
                    <li class="nav-item">
                    <a class="nav-link" href="#" id="down_cert_btn">NFT 인증서 다운로드</a>
                    </li>
                    <li class="nav-item">
                    <a class="nav-link" href="/auth/logout" style="color: red;">서비스 로그아웃</a>
                    </li>
                </ul>
                <span class="navbar-text" style="color: black; font-weight: 900;">
                    ${result.user.username} 님으로 로그인되었습니다
                </span>
                </div>
            </div>
        </nav>
        `
    } else {
        nav_content.innerHTML = `
        <nav class="navbar navbar-expand-lg bg-body-tertiary">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Meta Safe Contract Platform</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarText">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="#">소개</a>
                    </li>
                    <li class="nav-item">
                    <a class="nav-link" href="#">계약 참가</a>
                    </li>
                </ul>
                <span class="navbar-text">
                    <a href="/auth" style="text-decoration: none;"><button type="button" class="btn btn-outline-primary">서비스 로그인</button></a>
                    <a href="/auth/signup" style="text-decoration: none;"><button type="button" class="btn btn-outline-primary">서비스 회원가입</button></a>
                </span>
                </div>
            </div>
        </nav>
        `
    }

    document.getElementById("down_cert_btn").addEventListener("click", certMessage);
}