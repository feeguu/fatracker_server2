const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/sequelize");

class Section extends Model {}

const SectionPeriod = {
  MORNING: "MORNING",
  AFTERNOON: "AFTERNOON",
  NIGHT: "NIGHT",
};

Section.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    period: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: Object.values(SectionPeriod),
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    yearSemester: {
      type: DataTypes.ENUM,
      values: ["1", "2"],
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    paranoid: true,
    defaultScope: {
      order: [["id", "ASC"]],
    },
  }
);

module.exports = { Section, SectionPeriod };
