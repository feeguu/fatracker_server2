const { Sequelize } = require("sequelize");
const Config = require("./config");

const config = Config.getInstance();

const sequelize = new Sequelize({
  dialect: "mysql",
  database: config.db.name,
  host: config.db.host,
  username: config.db.user,
  password: config.db.password,
  port: config.db.port,
  logging: false,
});

module.exports = { sequelize };
