const { Model } = require("sequelize");
const { sequelize } = require("../config/sequelize");

class StudentSection extends Model {}

StudentSection.init(
  {},
  { sequelize, paranoid: true, defaultScope: { order: ["id"] } }
);

module.exports = { StudentSection };
