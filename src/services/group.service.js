const { sequelize } = require("../config/sequelize");
const HttpError = require("../errors/HttpError");
const { Course } = require("../models/course");
const { Group } = require("../models/group");
const { Section } = require("../models/section");
const { Student } = require("../models/student");
const { StudentGroup } = require("../models/student-group");

class GroupService {
  /**
   *
   * @param {import("./section.service").SectionService} sectionService
   * @param {import("./student.service").StudentService} studentService
   */
  constructor(sectionService, studentService) {
    this.sectionService = sectionService;
    this.studentService = studentService;
  }

  /**
   * @param {Object} param0
   * @param {number} param0.sectionId
   * @param {string} param0.name
   * @param {number[]} param0.membersRas
   * @param {number | undefined} param0.leaderRa
   */
  async create({ sectionId, name, membersRas, leaderRa }) {
    const section = await this.sectionService.getById(sectionId);
    if (!section) {
      throw new HttpError(404, "Section not found");
    }

    if (leaderRa && !membersRas.includes(leaderRa)) {
      throw new HttpError(400, "Leader must be a member of the group");
    }

    const students = [];

    for (const studentRa of membersRas) {
      const student = await this.studentService.findByRa(studentRa);
      if (!student) {
        throw new HttpError(404, "Student not found");
      }
      students.push(student);
    }

    const group = await sequelize.transaction(async (t) => {
      const group = await Group.create({ name, sectionId }, { transaction: t });
      const conflictingsStudents = [];
      for (const student of students) {
        const isLeader = student.ra === leaderRa;

        // check if student is not in another group in same section

        const conflict = await StudentGroup.findOne({
          where: {
            "$group.sectionId$": section.id,
            studentId: student.id,
          },
          include: {
            model: Group,
            as: "group",
            required: true,
          },
          transaction: t,
        });

        if (conflict) {
          conflictingsStudents.push(student.ra);
          continue;
        }

        const studentGroup = await StudentGroup.create(
          {
            studentId: student.id,
            groupId: group.id,
            isLeader,
          },
          {
            transaction: t,
          }
        );
      }
      if (conflictingsStudents.length > 0) {
        throw new HttpError(
          400,
          `Students ${conflictingsStudents.join(
            ", "
          )} are already in a group in this section`
        );
      }
      await group.reload({ transaction: t });

      return group;
    });

    return group;
  }

  async findMany({ offset, limit, sectionId, courseCode }) {
    const where = {};

    if (sectionId) {
      where["$section.id$"] = sectionId;
    }

    if (courseCode) {
      where["$section.course.code$"] = courseCode;
    }

    const groups = await Group.findAll({
      where,
      include: [
        {
          model: Section,
          as: "section",
          required: true,
          include: [{ model: Course, as: "course", required: true }],
        },
        {
          model: StudentGroup,
          as: "studentGroups",
          include: [{ model: Student, as: "student" }],
        },
      ],
      offset,
      limit,
    });

    return groups;
  }

  async findById(id) {
    const group = await Group.findByPk(id);

    return group;
  }
}

module.exports = { GroupService };
