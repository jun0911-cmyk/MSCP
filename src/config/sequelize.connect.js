const { sequelize } = require("../models");
const logger = require("../middlewares/log.middleware.js");

sequelize.sync({ force: false })
.then(() => {
  logger("sequelize DB Connect Success", "database");
})
.catch((error) => {
  logger("sequelize DB Error : " + error, "err");
});