const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/sequelize");
const { StudentGroup } = require("./student-group");
const { Student } = require("./student");

class Group extends Model {}

Group.init(
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
  },
  {
    sequelize,
    paranoid: true,
    defaultScope: {
      order: ["id"],
      include: [
        {
          model: StudentGroup,
          as: "studentGroups",
          include: [{ model: Student, as: "student" }],
        },
      ],
    },
  }
);

module.exports = { Group };
