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
    code,
    courseCode,
    isActive,
    period,
    yearSemester,
    semester,
    year,
  }) {
    const where = {};

    if (code) {
      where.code = {
        [Op.like]: `${code}%`,
      };
    }

    if (courseCode) {
      where.code = {
        [Op.like]: `${courseCode}%`,
      };
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

  async createSection({ courseId, period, year, yearSemester, semester }) {
    const course = await this.courseService.getById(courseId); // This verifies that the course exists, if not, it will throw an error

    const code = `${course.code}_${semester}-${period}-${yearSemester}/${year}`;

    const conflict = await Section.findOne({
      where: { code },
    });

    if (conflict) {
      throw new HttpError(409, "This section already exists");
    }

    return await Section.create({
      code,
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

  async getByCode(code) {
    const section = await Section.findOne({ where: { code } });
    return section;
  }
}

module.exports = { SectionService };
