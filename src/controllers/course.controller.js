const joi = require("joi");

class CourseController {
  /**
   *
   * @param {import("../services/course.service").CourseService} courseService
   */
  constructor(courseService) {
    this.courseService = courseService;
  }

  async getCourses(req, res) {
    const user = res.locals.user;
    const courses = await this.courseService.getByUser(user);
    res.status(200).json(courses);
  }

  async getCourseById(req, res) {
    const { id } = req.params;
    const course = await this.courseService.getById(id);
    res.status(200).json(course);
  }

  async createCourse(req, res) {
    const schema = joi.object({
      name: joi.string().required(),
      code: joi.string().required(),
      isAnnual: joi.boolean().required(),
    });

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      throw new HttpError(400, error.details.map((e) => e.message).join(", "));
    }

    const course = await this.courseService.create(value);

    res.status(201).json(course);
  }

  async updateCourse(req, res) {
    const { id } = req.params;
    const schema = joi.object({
      name: joi.string(),
      code: joi.string(),
      isAnnual: joi.boolean(),
    });

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      throw new HttpError(400, error.details.map((e) => e.message).join(", "));
    }

    const course = await this.courseService.update(id, value);

    res.status(200).json(course);
  }

  async deleteCourse(req, res) {
    const { id } = req.params;
    await this.courseService.delete(id);
    res.status(204).end();
  }
}

module.exports = { CourseController };
