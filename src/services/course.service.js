const { Op } = require("sequelize");
const HttpError = require("../errors/HttpError");
const { Coordination } = require("../models/coordination");
const { Course } = require("../models/course");
const { Section } = require("../models/section");
const { StudentSection } = require("../models/student-section");
const { Teaching } = require("../models/teaching");
const { StaffRole } = require("../models/staff-role");
const { Staff } = require("../models/staff");
const { required } = require("joi");

class CourseService {
  /**
   *
   * @param {import("./staff.service").StaffService} staffService
   */
  constructor(staffService) {
    this.staffService = staffService;
  }

  async getCoordinatorCourses(staff) {
    if (!staff.roles.includes("COORDINATOR")) {
      return [];
    }

    const staffRole = staff.staffRoles.find(
      (sr) => sr.role.name === "COORDINATOR"
    );

    if (!staffRole) {
      return [];
    }

    const coordinations = await Coordination.findAll({
      where: {
        staffRoleId: staffRole.id,
      },
      include: ["course"],
    });

    const courses = coordinations.map((coordination) => coordination.course);
    return courses;
  }

  async getProfessorCourses(staff) {
    if (!staff.roles.includes("PROFESSOR")) {
      return [];
    }

    const staffRole = staff.staffRoles.find(
      (sr) => sr.role.name === "PROFESSOR"
    );

    if (!staffRole) {
      return [];
    }

    const teachings = await Teaching.findAll({
      where: {
        staffRoleId: staffRole.id,
      },
      include: [
        {
          model: Section,
          as: "section",
          include: [
            {
              model: Course,
              as: "course",
            },
          ],
        },
      ],
    });

    const courses = teachings.map((teaching) => teaching.section.course);
    return courses;
  }
  /**
   *
   * @param {import("../models/staff").Staff} user
   */
  async getByUser(user, { offset, limit, code }) {
    if (user.roles.includes("ADMIN") || user.roles.includes("PRINCIPAL")) {
      const where = {};
      if (code) {
        where.code = {
          [Op.like]: `${code}%`,
        };
      }
      const courses = await Course.findAll({ limit, offset, where });
      return courses;
    }

    if (user.roles.includes("STUDENT")) {
      console.log("STUDENT");
      const courses = await Course.findAll({
        where: {
          "$sections.studentSections.studentId$": user.id,
        },
        include: [
          {
            model: Section,
            as: "sections",
            include: {
              model: StudentSection,
              as: "studentSections",
            },
          },
        ],
      });

      return courses;
    }

    const courses = [];

    courses.push(...(await this.getCoordinatorCourses(user)));
    courses.push(...(await this.getProfessorCourses(user)));

    return courses;
  }

  async getById(user, id) {
    const course = await Course.findByPk(id);

    if (!course) {
      throw new HttpError(404, "Course not found");
    }

    if (user.roles.includes("ADMIN") || user.roles.includes("PRINCIPAL")) {
      return course;
    }

    if (user.roles.includes("STUDENT")) {
      const studentSections = await StudentSection.findAll({
        where: { studentId: user.id },
      });

      const sectionIds = studentSections.map((ss) => ss.sectionId);

      const section = await Section.findOne({
        where: { courseId: course.id, id: sectionIds },
      });

      if (!section) {
        throw new HttpError(403, "Forbidden");
      }

      return course;
    }

    if (user.roles.includes("COORDINATOR")) {
      const coordination = await Coordination.findOne({
        where: {
          "$course.id$": course.id,
          "$staffRole.staff.id$": user.id,
        },
        include: [
          {
            model: Course,
            as: "course",
            required: true,
          },
          {
            model: StaffRole,
            as: "staffRole",
            required: true,
            include: {
              model: Staff,
              as: "staff",
              required: true,
            },
          },
        ],
      });

      if (!coordination) {
        throw new HttpError(403, "Forbidden");
      }

      return course;
    }

    if (user.roles.includes("PROFESSOR")) {
      const teaching = await Teaching.findOne({
        where: {
          "$section.courseId$": course.id,
          "$staffRole.staff.id$": user.id,
        },
        include: [
          {
            model: Section,
            as: "section",
            required: true,
          },
          {
            model: StaffRole,
            as: "staffRole",
            required: true,
            include: {
              model: Staff,
              as: "staff",
              required: true,
            },
          },
        ],
      });

      if (!teaching) {
        throw new HttpError(403, "Forbidden");
      }
    }

    return {};
  }

  async getByCode(code) {
    const course = await Course.findOne({ where: { code } });
    return course;
  }

  /**
   * @param {Object} param0
   * @param {string} param0.name
   * @param {string} param0.code
   * @param {boolean} param0.isAnnual
   */
  async create({ name, code, isAnnual }) {
    const conflict = await Course.findOne({ where: { code } });
    if (conflict) {
      throw new HttpError(409, "Course code already exists");
    }

    const course = await Course.create({ name, code, isAnnual });
    return course;
  }

  /**
   * @param {number} id
   * @param {Object} param1
   * @param {string | undefined} param1.name
   * @param {string | undefined} param1.code
   * @param {boolean | undefined} param1.isAnnual
   */

  async update(id, { name, code, isAnnual }) {
    const course = await Course.findByPk(id);
    if (!course) {
      throw new HttpError(404, "Course not found");
    }

    if (name) course.name = name;
    if (code) course.code = code;
    if (isAnnual) course.isAnnual = isAnnual;

    await course.save();
    return course;
  }

  async delete(id) {
    const course = await Course.findByPk(id);
    if (!course) {
      throw new HttpError(404, "Course not found");
    }

    await course.destroy();
  }

  async putStaff(courseId, staffId) {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new HttpError(404, "Course not found");
    }

    let staff = await this.staffService.findById(staffId);
    if (!staff) {
      throw new HttpError(404, "Staff not found");
    }

    if (!staff.roles.includes("COORDINATOR")) {
      staff = await this.staffService.addRole(staffId, "COORDINATOR");
    }

    const previousCoordination = await course.getCoordination();
    if (previousCoordination) {
      console.log(previousCoordination);
      await previousCoordination.destroy();
    }

    await staff.reload();

    const staffRole = staff.staffRoles.find(
      (sr) => sr.role.name === "COORDINATOR"
    );

    const coordination = await Coordination.create({
      courseId,
      staffRoleId: staffRole.id,
    });

    await course.setCoordination(coordination);

    await course.reload();
    return course;
  }

  async removeStaff(courseId) {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new HttpError(404, "Course not found");
    }

    const coordination = await course.getCoordination();
    if (!coordination) {
      throw new HttpError(404, "Coordination not found");
    }

    await coordination.destroy();
  }
}

module.exports = { CourseService };
