const { sequelize } = require("../config/sequelize");
const { Model, DataTypes, Op } = require("sequelize");
const { StaffRole } = require("./staff-role");
const { Role } = require("./role");

class Staff extends Model {}

Staff.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roles: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.staffRoles?.map((staffRole) => staffRole.role?.name) || [];
      },
    },
  },
  {
    sequelize,
    paranoid: true,
    defaultScope: {
      include: [
        {
          model: StaffRole,
          as: "staffRoles",
        },
      ],
      attributes: {
        exclude: ["password"],
      },
    },
    scopes: {
      withPassword: {
        include: [
          {
            model: StaffRole,
            as: "staffRoles",
          },
        ],
        attributes: {
          include: ["password"],
        },
      },
    },
  }
);

module.exports = { Staff };
