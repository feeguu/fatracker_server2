const { Model } = require("sequelize");
const { sequelize } = require("../config/sequelize");
const { Role } = require("./role");

class StaffRole extends Model {}

StaffRole.init(
  {},
  {
    sequelize,
    paranoid: true,
    defaultScope: {
      include: [{ model: Role, as: "role" }],
    },
  }
);

module.exports = { StaffRole };
