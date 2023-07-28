const nav_content = document.getElementById("nav_container");

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
        <nav class="navbar navbar-expand-lg bg-body-tertiary">
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
                    <a class="nav-link" href="#">계약 참가</a>
                    </li>
                    <li class="nav-item">
                    <a class="nav-link" href="#">NFT 인증서 다운로드</a>
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
}