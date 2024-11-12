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

    const sections = await this.sectionService.findAll(value);

    return res.status(200).json(sections);
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

    const section = await this.sectionService.create(value);

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

    const section = await this.sectionService.update(req.params.id, value);

    return res.status(200).json(section);
  }

  async deleteSection(req, res) {
    await this.sectionService.delete(req.params.id);

    return res.status(204).end();
  }
}

module.exports = { SectionController };
