const { Model } = require("sequelize");
const { sequelize } = require("../config/sequelize");
const { Role } = require("./role");
const { Coordination } = require("./coordination");

class StaffRole extends Model {}

StaffRole.init(
  {},
  {
    sequelize,
    paranoid: true,
    defaultScope: {
      include: [
        { model: Role, as: "role" },
        { model: Coordination, as: "coordinations" },
      ],
    },
  }
);

module.exports = { StaffRole };
