const create_room = async (accesser) => {
    const response = await $.ajax({
        url: '/room/create',
        type: 'POST',
        data: JSON.stringify({ 
            access: accesser 
        }),
        headers: {
            "Content-Type": "application/json"
        },
    });   

    if (response.status == "200" && response.message == "created room") {
        return true;
    } else {
        return false;
    }
}

const room_list = async (accesser) => {
    const response = await $.ajax({
        url: '/room/list',
        type: 'GET',
    });   

    if (response.status == "200") {
        return response.rooms;
    } else {
        return null;
    }
}

export default {
    create_room,
    room_list,
};