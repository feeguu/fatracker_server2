const { Model } = require("sequelize");
const { sequelize } = require("../config/sequelize");

class Teaching extends Model {}

Teaching.init(
  {},
  {
    sequelize,
    paranoid: true,
    defaultScope: {
      order: ["id"],
    },
  }
);

module.exports = { Teaching };
