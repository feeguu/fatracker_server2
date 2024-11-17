const { Model } = require("sequelize");
const { sequelize } = require("../config/sequelize");

class StudentSection extends Model {}

StudentSection.init({}, { sequelize, paranoid: true });

module.exports = { StudentSection };
