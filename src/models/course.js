const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/sequelize");

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
  { sequelize: sequelize, paranoid: true }
);

module.exports = { Course };
