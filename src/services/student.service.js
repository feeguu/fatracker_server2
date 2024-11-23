const bcrypt = require("bcrypt");

const HttpError = require("../errors/HttpError");
const { Student } = require("../models/student");
const { StudentSection } = require("../models/student-section");
const { Section } = require("../models/section");
const { Course } = require("../models/course");

const { getUserByEmail } = require("../utils/email");
const { Op } = require("sequelize");

class StudentService {
  async findByRa(ra, includePassword = false) {
    let student = null;
    if (includePassword) {
      student = await Student.scope("withPassword").findOne({ where: { ra } });
    } else {
      student = await Student.findOne({ where: { ra } });
    }

    return student;
  }

  async findById(id) {
    const student = await Student.findByPk(id);
    return student;
  }

  async findAll({ offset, limit, sectionId, courseCode }) {
    const where = {};

    if (sectionId) {
      const section = await Section.findOne({
        where: { id: sectionId },
      });

      if (!section) {
        return [];
      }

      const studentSections = await StudentSection.findAll({
        where: { sectionId: section.id },
      });

      where.id = {
        [Op.in]: studentSections.map(
          (studentSection) => studentSection.studentId
        ),
      };
    }

    if (courseCode) {
      const course = await Course.findOne({ where: { code: courseCode } });
      if (!course) {
        return [];
      }

      const sections = await Section.findAll({
        where: { courseId: course.id },
      });

      const studentSections = await StudentSection.findAll({
        where: { sectionId: sections.map((section) => section.id) },
      });

      where.id = {
        [Op.in]: studentSections.map(
          (studentSection) => studentSection.studentId
        ),
      };
    }

    const students = await Student.findAll({
      where,
      offset,
      limit,
    });

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
      const conflict = await getUserByEmail(email);
      if (conflict && conflict?.ra !== ra) {
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

  async addToSection(ra, sectionId) {
    const student = await this.findByRa(ra);

    if (!student) {
      throw new HttpError(404, "Student not found");
    }

    const section = await Section.findByPk(sectionId);
    if (!section) {
      throw new HttpError(404, "Section not found");
    }

    const studentSectionConflict = await StudentSection.findOne({
      where: { studentId: student.id, sectionId: section.id },
    });

    if (studentSectionConflict) {
      throw new HttpError(409, "Student already in section");
    }

    await StudentSection.create({
      studentId: student.id,
      sectionId: section.id,
    });
    await student.reload();
    return student;
  }

  async removeFromSection(ra, sectionId) {
    const student = await this.findByRa(ra);

    if (!student) {
      throw new HttpError(404, "Student not found");
    }

    const section = await Section.findByPk(sectionId);
    if (!section) {
      throw new HttpError(404, "Section not found");
    }

    const studentSection = await StudentSection.findOne({
      where: { studentId: student.id, sectionId: section.id },
    });

    if (!studentSection) {
      throw new HttpError(404, "Student not in section");
    }

    await studentSection.destroy();
    await student.reload();
    return student;
  }

  async getSections(ra) {
    const student = await this.findByRa(ra);

    if (!student) {
      throw new HttpError(404, "Student not found");
    }

    const studentSections = await StudentSection.findAll({
      where: { studentId: student.id },
      include: { model: Section, as: "section" },
    });

    return studentSections.map((studentSection) => studentSection.section);
  }
}

module.exports = { StudentService };
