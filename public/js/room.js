import room from "./modules/room.module.js";
import fileHandle from "./modules/file.module.js";

const create_btn = document.getElementById("room_create_btn");
const row = document.getElementById("room_table");

const appendRooms = async () => {
    const rooms = await room.room_list();

    if (rooms == null) {
        return null;
    }

    for (let i = 0; i <= rooms.length - 1; i++) {
        row.innerHTML += `
        <tr>
            <th scope="row">${String(i + 1)}</th>
            <td>${rooms[i].room_name}</td>
            <td>${rooms[i].organizer_username}</td>
            <td>${rooms[i].participant_username}</td>
            <td>Activty</td>
            <td>${rooms[i].room_people}</td>
            <td><button id="join_room_${rooms[i].organizer_username}">JOIN</button></td>
        </tr>
        `;
    }
}

create_btn.addEventListener("click", async () => {
    const accesser = document.getElementById("accesser").value;
    const file = document.getElementById("inputGroupFile02").files[0];
    const result = await fileHandle.file_upload(file, "/contract/file/upload", "contract_file");

    if (result.message == "success") {
        const isRoomCreated = await room.create_room(accesser);

        console.log(isRoomCreated);
    }  else {
        console.log("room create failure");
    }
});

appendRooms();