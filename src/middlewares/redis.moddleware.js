const redis = require("redis");
const logger = require("./log.middleware.js");

const client = redis.createClient(6379, "127.0.0.1");

client.on("connect", () => {
    logger("connected redis server, 127.0.0.1:6379", "server");
});

(async () => {
    await client.connect();
})();

module.exports = client;