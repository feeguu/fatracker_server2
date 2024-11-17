const { Model } = require("sequelize");
const { sequelize } = require("../config/sequelize");
const { Role } = require("./role");
const { Coordination } = require("./coordination");
const { Teaching } = require("./teaching");

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
        { model: Teaching, as: "teachings" },
      ],
    },
  }
);

module.exports = { StaffRole };
