const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/sequelize");
const { Coordination } = require("./coordination");
const { StaffRole } = require("./staff-role");
const { Staff } = require("./staff");

class Course extends Model {}

Course.init(
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
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isAnnual: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize: sequelize,
    paranoid: true,
    defaultScope: {
      include: [
        {
          model: Coordination,
          as: "coordination",
          include: [
            {
              model: StaffRole,
              as: "staffRole",
              include: [
                {
                  model: Staff,
                  as: "staff",
                },
              ],
            },
          ],
        },
      ],
    },
  }
);

module.exports = { Course };
