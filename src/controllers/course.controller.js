const joi = require("joi");
const HttpError = require("../errors/HttpError");

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

    const querySchema = joi.object({
      offset: joi.number().integer().min(0).default(0),
      limit: joi.number().integer().min(1),

      code: joi.string().trim(),
    });

    const { value, error } = querySchema.validate(req.query, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      throw new HttpError(400, error.details.map((e) => e.message).join(", "));
    }

    const courses = await this.courseService.getByUser(user, value);
    res.status(200).json(courses);
  }

  async getCourseById(req, res) {
    const { id } = req.params;
    const user = res.locals.user; // for filtering access
    const course = await this.courseService.getById(user, id);
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

  async putCourseStaff(req, res) {
    const { id } = req.params;

    const schema = joi.object({
      staffId: joi.number().required(),
    });

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      throw new HttpError(400, error.details.map((e) => e.message).join(", "));
    }

    const course = await this.courseService.putStaff(id, value.staffId);
    res.status(200).json(course);
  }

  async deleteCourseStaff(req, res) {
    const { id } = req.params;
    await this.courseService.removeStaff(id);
    res.status(204).end();
  }
}

module.exports = { CourseController };
