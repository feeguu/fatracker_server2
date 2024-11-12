const { Model } = require("sequelize");
const { sequelize } = require("../config/sequelize");

class Teaching extends Model {}

Teaching.init(
  {},
  {
    sequelize,
    paranoid: true,
  }
);

module.exports = { Teaching };
