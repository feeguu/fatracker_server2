const { Staff } = require("../models/staff");
const { Student } = require("../models/student");

async function getUserByEmail(email, includePassword = false) {
  const where = { email };

  const StaffModel = includePassword ? Staff.scope("withPassword") : Staff;
  const staff = await StaffModel.findOne({ where });

  const StudentModel = includePassword
    ? Student.scope("withPassword")
    : Student;
  const student = await StudentModel.findOne({ where });

  return staff || student;
}

module.exports = {
  getUserByEmail,
};
