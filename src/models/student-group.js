const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/sequelize");
const { Student } = require("./student");

class StudentGroup extends Model {}

StudentGroup.init(
  {
    isLeader: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize,
    paranoid: true,
    defaultScope: {
      order: ["id"],
      include: [{ model: Student, as: "student" }],
    },
  }
);

module.exports = { StudentGroup };
