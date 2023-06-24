const fs = require("fs");

const writeLog = (message, filename) => {
    filename = "./logs/" + filename + ".txt"
    fs.appendFile(filename, message, err => {
        if (err) {
            console.log("[LOGGER ERROR] : log system error, err : " + err); 
        }
    });

    return "ok";
}

const log = (message, log_type) => {
    const date = new Date();

    message = `[TIME : ${String(date.getTime())}] [LOGGER ${log_type} LOG] : ${message}`;

    console.log(message);

    message = message + "\n";

    return writeLog(message, log_type + ".log");
}

module.exports = log;