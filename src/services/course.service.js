const HttpError = require("../errors/HttpError");
const { Course } = require("../models/course");

class CourseService {
  /**
   *
   * @param {import("./staff.service").StaffService} staffService
   */
  constructor(staffService) {
    this.staffService = staffService;
  }

  /**
   *
   * @param {import("../models/staff").Staff} user
   */
  async getByUser(user) {
    // TODO: Get courses by user, atm this gets all courses
    const courses = Course.findAll();
    return courses;
  }

  async getById(id) {
    const course = await Course.findByPk(id);
    if (!course) {
      throw new HttpError(404, "Course not found");
    }
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
}

module.exports = { CourseService };
