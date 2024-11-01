const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/sequelize");

class Role extends Model {}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  { sequelize, paranoid: true }
);

module.exports = { Role };
