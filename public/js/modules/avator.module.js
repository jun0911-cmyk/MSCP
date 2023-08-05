const loadLocalAvator = (socket) => {
    const avatorPath = "/static/image/default_avator.png";
    const avatorContainer = document.getElementById("local-avator");

    avatorContainer.src = avatorPath;

    $("#local").hide();
    $("#local-avator-container").show();

    socket.emit("use_avator", avatorPath);
}

const loadRemoteAvator = (avatorPath) => {
    const avatorContainer = document.getElementById("remote-avator");

    avatorContainer.src = avatorPath;

    $("#remote").hide();
    $("#remote-avator-container").show();
}

const deleteLocalAvator = (socket) => {
    $("#local").show();
    $("#local-avator-container").hide();

    socket.emit("use_avator", "delete");
}

const deleteRemoteAvator = () => {
    $("#remote").show();
    $("#remote-avator-container").hide();
}

const changeLocalAvator = (type, socket) => {
    if ($("#local-avator-container").is(":visible")) {
        const srcPath = "/static/image/" + type.replace(/\s/g, '') + "_avator.png"
        const avatorContainer = document.getElementById("local-avator");

        avatorContainer.src = srcPath;

        socket.emit("use_avator", srcPath);
    }
}


export default {
    loadLocalAvator,
    loadRemoteAvator,
    deleteLocalAvator,
    deleteRemoteAvator,
    changeLocalAvator,
}