const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/sequelize");

class Assignment extends Model {}

Assignment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    paranoid: true,
    defaultScope: {
      order: ["id"],
    },
  }
);

module.exports = {
  Assignment,
};
