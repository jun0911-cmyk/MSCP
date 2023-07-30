import room from "./modules/room.module.js";
import fileHandle from "./modules/file.module.js";

const create_btn = document.getElementById("room_create_btn");
const row = document.getElementById("room_table");
const cert_verify_btn = document.getElementById("cert_verify_btn");
const toggle_room_btn = document.getElementById("toggle_create_room_btn");
const cancel_join_btn = document.getElementById("cancel_join_btn");
const search_btn = document.getElementById("search_btn");

let organizer_username = "";

$("#contract_room_container").hide();
$("#popup").hide();
$("#fail_msg").hide();

const searchRoom = async (keyword) => {
    const response = await $.ajax({
        url: '/room/list?search=' + keyword,
        type: 'GET',
    });   

    if (response.status == "200") {
        return response.rooms;
    } else {
        return null;
    }
}

const appendRooms = async () => {
    const rooms = await room.room_list();
    const contractRoomCount = document.getElementById("count_contract_room");

    if (rooms == null) {
        return null;
    }

    for (let i = 0; i <= rooms.length - 1; i++) {
        let status = "";

        if (rooms[i].room_people == 0) {
            status = "생성됨";
        } else if (rooms[i].room_people == 1) {
            status = "계약대기중";
        } else if (rooms[i].room_people == 2) {
            status = "계약진행중";
        }

        row.innerHTML += `
        <tr>
            <th scope="row">${String(i + 1)}</th>
            <td>${rooms[i].room_name}</td>
            <td>${rooms[i].organizer_username}</td>
            <td>${rooms[i].participant_username}</td>
            <td>${status}</td>
            <td>${rooms[i].room_people}명</td>
            <td><button id="join_room" class="btn btn-primary btn-sm">참가하기</button></td>
        </tr>
        `;
    }

    contractRoomCount.innerText = `대한민국에서 현재 진행중인 온라인 계약 : ${rooms.length}건`

    $(document).on("click", "#join_room", async function () {
        const popup_message = document.getElementById("connect_message");
        
        organizer_username = $(this).parent().parent().children().eq(2)[0].innerText;
        popup_message.innerText = organizer_username + " 계약룸 접속";

        $("#popup").show();
    });
}

cancel_join_btn.addEventListener("click", () => {
    const popup = document.getElementById("popup");

    if (popup) {
        const popup_message = document.getElementById("connect_message");

        popup_message.innerText = "";
        
        $("#fail_msg").hide();
        $("#popup").hide();
    }
});

toggle_room_btn.addEventListener("click", () => {
    const value = toggle_room_btn.innerText;

    if (value == "계약룸 생성하기") {
        $("#contract_room_container").show();

        toggle_room_btn.innerText = "생성창 닫기";
    } else if (value == "생성창 닫기") {
        $("#contract_room_container").hide();

        toggle_room_btn.innerText = "계약룸 생성하기";
    }
});

create_btn.addEventListener("click", async () => {
    const accesser = document.getElementById("accesser").value;
    const password = document.getElementById("password").value;
    const file = document.getElementById("inputGroupFile02").files[0];
    const result = await fileHandle.file_upload(file, "/contract/file/upload", "contract_file");

    if (result.message == "success") {
        const isRoomCreated = await room.create_room(accesser, password);

        if (isRoomCreated) {
            Swal.fire(
                '계약룸 생성 성공',
                '계약룸이 성공적으로 생성되었습니다!',
                'error'
            );
        } else {
            Swal.fire(
                '계약룸 생성실패',
                '계약룸 생성에 실패하였습니다. 올바른 계약서를 업로드하셨는지, 조건에 맞는 참여자를 입력하셨는지 확인하시고 다시 시도해주세요.',
                'error'
            );
        }
    }  else {
        Swal.fire(
            '계약룸 생성실패',
            '계약룸 생성에 실패하였습니다. 올바른 계약서를 업로드하셨는지, 조건에 맞는 참여자를 입력하셨는지 확인하시고 다시 시도해주세요.',
            'error'
        );
    }
});

cert_verify_btn.addEventListener("click", async () => {
    const cert_file = document.getElementById("inputGroupFile03").files[0];
    const contract_file = document.getElementById("inputGroupFile04").files[0];
    const password = document.getElementById("room_password").value;
    const cert_result = await fileHandle.file_upload(cert_file, "/contract/certificate/verify", "certificate_file");
    const contract_result = await fileHandle.file_upload(contract_file, "/contract/file/verify", "contract_file");

    if (cert_file == null || contract_result == null) {
        document.getElementById("fail_msg").innerHTML = "계약룸 접속에 실패하였습니다.</br>올바른 인증서를 업로드하셨는지,</br>계약룸에 맞는 계약서를 업로드하셨는지 확인해주세요.";

        $("#fail_msg").show();
    }

    if (cert_result.message == "Authed" && contract_result.message == "Authed") {
        $("#fail_msg").hide();

        location.href = "/room/join/" + organizer_username + "?password=" + password;
    }
});

search_btn.addEventListener("click", async () => {
    const keyword = document.getElementById("search_value").value;

    let room_row = "";

    if (keyword) {
        const rooms = await searchRoom(keyword);

        if (rooms == null) {
            row.innerHTML = "";
            
            return null;
        }
    
        for (let i = 0; i <= rooms.length - 1; i++) {
            let status = "";
    
            if (rooms[i].room_people == 0) {
                status = "생성됨";
            } else if (rooms[i].room_people == 1) {
                status = "계약대기중";
            } else if (rooms[i].room_people == 2) {
                status = "계약진행중";
            }
    
            room_row += `
            <tr>
                <th scope="row">${String(i + 1)}</th>
                <td>${rooms[i].room_name}</td>
                <td>${rooms[i].organizer_username}</td>
                <td>${rooms[i].participant_username}</td>
                <td>${status}</td>
                <td>${rooms[i].room_people}명</td>
                <td><button id="join_room" class="btn btn-primary btn-sm">참가하기</button></td>
            </tr>
            `;
        }

        row.innerHTML = room_row;
        
        room_row = "";
    }
});

appendRooms();