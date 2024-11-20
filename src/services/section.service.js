const { Op } = require("sequelize");
const HttpError = require("../errors/HttpError");
const { Section } = require("../models/section");
const { Staff } = require("../models/staff");
const { Role } = require("../models/role");
const { Teaching } = require("../models/teaching");
const { Coordination } = require("../models/coordination");
const { StudentSection } = require("../models/student-section");
const { StaffRole } = require("../models/staff-role");
const { Course } = require("../models/course");

class SectionService {
  /**
   * @param {import("../services/course.service").CourseService} courseService
   * @param {import("../services/staff.service").StaffService} staffService
   */

  constructor(courseService, staffService) {
    this.courseService = courseService;
    this.staffService = staffService;
  }

  async findAll({
    offset,
    limit,
    courseCode,
    isActive,
    period,
    yearSemester,
    semester,
    year,
  }) {
    const where = {};

    const course = await this.courseService.getByCode(courseCode.toUpperCase());

    if (courseCode) {
      where.courseId = course.id;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (period) {
      where.period = period;
    }

    if (yearSemester) {
      where.yearSemester = yearSemester;
    }

    if (semester) {
      where.semester = semester;
    }

    if (year) {
      where.year = year;
    }

    return await Section.findAll({
      where,
      offset,
      limit,
    });
  }

  async create(user, { courseId, period, year, yearSemester, semester }) {
    const course = await this.courseService.getById(user, courseId); // This verifies that the course exists, if not, it will throw an error

    const conflict = await Section.findOne({
      where: { courseId, year, semester, yearSemester, period },
    });

    if (conflict) {
      throw new HttpError(409, "This section already exists");
    }

    return await Section.create({
      period,
      courseId: course.id,
      year,
      yearSemester,
      semester,
    });
  }

  async getById(id) {
    const section = await Section.findByPk(id);
    if (!section) {
      throw new HttpError(404, "Section not found");
    }
    return section;
  }

  async update(id, { period, year, yearSemester, semester }) {
    const section = await this.getById(id);

    if (period) section.period = period;
    if (year) section.year = year;
    if (yearSemester) section.yearSemester = yearSemester;
    if (semester) section.semester = semester;

    return await section.save();
  }

  async delete(id) {
    const section = await this.getById(id);
    await section.destroy();
  }

  async assignProfessor(sectionId, staffId) {
    const section = await this.getById(sectionId);
    let staff = await this.staffService.findById(staffId);

    if (!staff) {
      throw new HttpError(404, "Staff not found");
    }

    const role = Role.findOne({ where: { name: "PROFESSOR" } });

    if (!staff.roles.includes("PROFESSOR")) {
      staff = this.staffService.addRole(staff.id, "PROFESSOR");
    }

    const staffRoles = staff.staffRoles.find(
      (sr) => sr.role.name == "PROFESSOR"
    );

    const oldTeaching = await section.getTeaching();

    if (oldTeaching) {
      if (oldTeaching.staffRoleId == staffRoles.id) return section;
      await oldTeaching.destroy();
    }

    const teaching = await Teaching.create({
      sectionId: section.id,
      staffRoleId: staffRoles.id,
    });

    await section.reload();
    return section;
  }

  async unassignProfessor(sectionId) {
    const section = await this.getById(sectionId);
    const teaching = await section.getTeaching();

    if (!teaching) {
      throw new HttpError(
        404,
        "There is no professor assigned to this section"
      );
    }

    await teaching.destroy();
  }

  async getUserPermissions(user, sectionId) {
    const section = await this.getById(sectionId);

    const permissions = {
      view: false,
      edit: false,
    };

    if (user.roles.includes("ADMIN")) {
      permissions.view = true;
      permissions.edit = true;
      return permissions;
    }

    if (user.roles.includes("PROFESSOR")) {
      const teaching = await Teaching.findOne({
        where: {
          "$section.id$": section.id,
          "$staffRole.staffId$": user.id,
        },
        include: [
          {
            model: StaffRole,
            as: "staffRole",
            required: true,
          },
          {
            model: Section,
            as: "section",
            required: true,
          },
        ],
      });

      if (teaching) {
        permissions.view = true;
        permissions.edit = true;

        return permissions;
      }
    }

    if (user.roles.includes("COORDINATOR")) {
      const coordination = await Coordination.findOne({
        where: {
          "$course.id$": section.courseId,
          "$staffRole.staffId$": user.id,
        },
        include: [
          {
            model: StaffRole,
            as: "staffRole",
            required: true,
          },
          { model: Course, as: "course", required: true },
        ],
      });

      if (coordination) {
        permissions.view = true;
        permissions.edit = true;

        return permissions;
      }
    }

    if (user.roles.includes("STUDENT")) {
      const studentSection = await StudentSection.findOne({
        where: {
          sectionId: section.id,
          studentId: user.id,
        },
      });

      if (studentSection) {
        permissions.view = true;
        permissions.edit = false;

        return permissions;
      }
    }

    return permissions;
  }
}

module.exports = { SectionService };
