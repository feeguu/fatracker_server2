const bcrypt = require("bcrypt");

const HttpError = require("../errors/HttpError");
const { Student } = require("../models/student");

class StudentService {
  async findByRa(ra) {
    const student = await Student.findOne({ where: { ra } });
    if (!student) {
      throw new HttpError(404, "Student not found");
    }
    return student;
  }

  async findAll({ offset, limit }) {
    const students = await Student.findAll({ offset, limit });
    return students;
  }

  async findOrCreate({ ra, name }) {
    const generatedPassword = // ra + first name without accents and lowercase
      String(ra) +
      name
        .split(" ")[0]
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);
    const [student, created] = await Student.findOrCreate({
      where: { ra },
      defaults: { name, password: hashedPassword },
    });

    await student.reload(); // for password to be excluded, for some reason findOrCreate doesn't follow the default scope

    return {
      created,
      student,
    };
  }

  async update(ra, { name, email }) {
    const student = await this.findByRa(ra);
    if (name) student.name = name;
    if (email) {
      const conflict = await Student.findOne({ where: { email } });
      if (conflict) {
        throw new HttpError(409, "Email already in use");
      }
      student.email = email;
    }
    await student.save();
    return student;
  }

  async delete(ra) {
    const student = await this.findByRa(ra);
    await student.destroy();
  }
}

module.exports = { StudentService };
