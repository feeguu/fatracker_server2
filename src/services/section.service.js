const { Op } = require("sequelize");
const HttpError = require("../errors/HttpError");
const { Section } = require("../models/section");

class SectionService {
  /**
   * @param {import("../services/course.service").CourseService} courseService
   */
  constructor(courseService) {
    this.courseService = courseService;
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

  async create({ courseId, period, year, yearSemester, semester }) {
    const course = await this.courseService.getById(courseId); // This verifies that the course exists, if not, it will throw an error

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
}

module.exports = { SectionService };
