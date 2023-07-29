import room from "./modules/room.module.js";
import fileHandle from "./modules/file.module.js";

const create_btn = document.getElementById("room_create_btn");
const row = document.getElementById("room_table");
const cert_verify_btn = document.getElementById("cert_verify_btn");
const toggle_room_btn = document.getElementById("toggle_create_room_btn");

let organizer_username = "";

$("#contract_room_container").hide();

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
        document.getElementById("popupOverlay").style.display = "block";
        organizer_username = $(this).parent().parent().children().eq(2)[0].innerText;
    });
}

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

        console.log(isRoomCreated);
    }  else {
        console.log("room create failure");
    }
});

cert_verify_btn.addEventListener("click", async () => {
    const cert_file = document.getElementById("inputGroupFile03").files[0];
    const contract_file = document.getElementById("inputGroupFile04").files[0];
    const password = document.getElementById("room_password").value;
    const cert_result = await fileHandle.file_upload(cert_file, "/contract/certificate/verify", "certificate_file");
    const contract_result = await fileHandle.file_upload(contract_file, "/contract/file/verify", "contract_file");

    if (cert_result.message == "Authed" && contract_result.message == "Authed") {
        location.href = "/room/join/" + organizer_username + "?password=" + password;
    } else {
        console.log("certificate file no cert");
    }
});

appendRooms();