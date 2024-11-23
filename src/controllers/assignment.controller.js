const joi = require("joi");
const HttpError = require("../errors/HttpError");

class AssignmentController {
  /**
   *
   * @param {import("../services/assignment.service").AssignmentService} assignmentService
   */
  constructor(assignmentService) {
    this.assignmentService = assignmentService;
  }

  async createAssignment(req, res) {
    const user = res.locals.user;
    const bodySchema = joi.object({
      sectionId: joi.number().integer().required(),
      title: joi.string().trim().required(),
      content: joi.string().trim().required(),
      dueDate: joi.date().iso().greater("now").required(),
    });
    const { value, error } = bodySchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
    if (error) {
      throw new HttpError(400, error.details.map((e) => e.message).join(", "));
    }
    const assignment = await this.assignmentService.create(user, value);
    return res.status(201).json(assignment);
  }

  async getAssignments(req, res) {
    const querySchema = joi.object({
      sectionId: joi.number().integer(),
      courseId: joi.number().integer(),
      expired: joi.boolean(),
    });

    const { value, error } = querySchema.validate(req.query, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      throw new HttpError(400, error.details.map((e) => e.message).join(", "));
    }

    const user = res.locals.user;
    const assignments = await this.assignmentService.findAll(user, value);
    return res.json(assignments);
  }

  async getAssignment(req, res) {
    const user = res.locals.user;
    const id = parseInt(req.params.id);
    const assignment = await this.assignmentService.findById(user, id);
    return res.json(assignment);
  }

  async updateAssignment(req, res) {
    const user = res.locals.user;
    const id = parseInt(req.params.id);
    const bodySchema = joi.object({
      title: joi.string().trim(),
      content: joi.string().trim(),
      dueDate: joi.date().iso(),
    });

    const { value, error } = bodySchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      throw new HttpError(400, error.details.map((e) => e.message).join(", "));
    }

    const assignment = await this.assignmentService.update(user, id, value);

    return res.json(assignment);
  }

  async deleteAssignment(req, res) {
    const user = res.locals.user;
    const id = parseInt(req.params.id);
    await this.assignmentService.delete(user, id);
    return res.status(204).send();
  }
}

module.exports = { AssignmentController };
