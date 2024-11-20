const { Model } = require("sequelize");
const { sequelize } = require("../config/sequelize");

class Coordination extends Model {}

Coordination.init(
  {},
  {
    sequelize,
    paranoid: true,
    defaultScope: {
      order: ["id"],
    },
  }
);

module.exports = { Coordination };
