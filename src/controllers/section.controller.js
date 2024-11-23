const joi = require("joi");
const HttpError = require("../errors/HttpError");

class SectionController {
  /**
   *
   * @param {import("../services/section.service").SectionService} sectionService
   */
  constructor(sectionService) {
    this.sectionService = sectionService;
  }

  /*
   * query params:
   * pagination:
   * - offset
   * - limit
   * filters:
   * - courseCode
   * - isActive
   * - period
   * - yearSemester
   * - semester
   * - year
   */
  async getSections(req, res) {
    const querySchema = joi.object({
      offset: joi.number().integer().min(0).default(0),
      limit: joi.number().integer().min(1),
      courseCode: joi.string().trim(),
      code: joi.string().trim(),
      isActive: joi.boolean(),
      period: joi.string().valid("MORNING", "AFTERNOON", "NIGHT"),
      yearSemester: joi.string().valid("1", "2"),
      semester: joi.number().integer().min(1),
      year: joi.number().integer().min(1),
    });

    const { value, error } = querySchema.validate(req.query, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      throw new HttpError(
        400,
        error.details.map((detail) => detail.message).join(", ")
      );
    }
    const user = res.locals.user;

    const sections = await this.sectionService.findAll(user, value);

    return res.status(200).json(sections);
  }

  async getSection(req, res) {
    const user = res.locals.user;
    const section = await this.sectionService.getById(user, req.params.id);
    return res.status(200).json(section);
  }

  async createSection(req, res) {
    const bodySchema = joi.object({
      courseId: joi.number().integer().required(),
      period: joi.string().valid("MORNING", "AFTERNOON", "NIGHT").required(),
      year: joi.number().integer().required().min(1),
      semester: joi.number().integer().required().min(1),
      yearSemester: joi
        .alternatives()
        .try(joi.string().valid("1", "2"), joi.number().valid(1, 2))
        .required()
        .custom((value, helpers) => {
          return String(value);
        }),
    });

    const { value, error } = bodySchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      throw new HttpError(
        400,
        error.details.map((detail) => detail.message).join(", ")
      );
    }

    const user = res.locals.user;

    const section = await this.sectionService.create(user, value);

    return res.status(201).json(section);
  }

  async updateSection(req, res) {
    const bodySchema = joi.object({
      period: joi.string().valid("MORNING", "AFTERNOON", "NIGHT"),
      year: joi.number().integer().min(1),
      semester: joi.number().integer().min(1),
      yearSemester: joi
        .alternatives()
        .try(joi.string().valid("1", "2"), joi.number().valid(1, 2))
        .custom((value, helpers) => {
          return String(value);
        }),
    });

    const { value, error } = bodySchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      throw new HttpError(
        400,
        error.details.map((detail) => detail.message).join(", ")
      );
    }

    const user = res.locals.user;
    const section = await this.sectionService.update(
      user,
      req.params.id,
      value
    );

    return res.status(200).json(section);
  }

  async deleteSection(req, res) {
    const user = res.locals.user;
    await this.sectionService.delete(user, req.params.id);

    return res.status(204).end();
  }

  async assignProfessor(req, res) {
    const bodySchema = joi.object({
      staffId: joi.number().integer().required(),
    });

    const { value, error } = bodySchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      throw new HttpError(
        400,
        error.details.map((detail) => detail.message).join(", ")
      );
    }
    const user = res.locals.user;
    const newSection = await this.sectionService.assignProfessor(
      user,
      req.params.id,
      value.staffId
    );

    return res.status(200).json(newSection);
  }

  async unassignProfessor(req, res) {
    const user = res.locals.user;
    const newSection = await this.sectionService.unassignProfessor(
      user,
      req.params.id
    );

    return res.status(200).json(newSection);
  }
}

module.exports = { SectionController };
