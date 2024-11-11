const { Op } = require("sequelize");
const HttpError = require("../errors/HttpError");
const { Coordination } = require("../models/coordination");
const { Course } = require("../models/course");
const { Section } = require("../models/section");

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

    // TODO: Implementar a busca de cursos por professor
    return [];
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
    const courses = [];

    courses.push(...(await this.getCoordinatorCourses(user)));
    courses.push(...(await this.getProfessorCourses(user)));

    return courses;
  }

  async getById(id) {
    const course = await Course.findByPk(id);
    if (!course) {
      throw new HttpError(404, "Course not found");
    }
    return course;
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
