const joi = require("joi");
const HttpError = require("../errors/HttpError");

class GroupController {
  /**
   *
   * @param {import("../services/group.service").GroupService} groupService
   */
  constructor(groupService) {
    this.groupService = groupService;
  }

  async createGroup(req, res) {
    const bodySchema = joi.object({
      sectionId: joi.number().integer().required(),
      name: joi.string().trim().required(),
      membersRas: joi.array().items(joi.string()).default([]),
      leaderRa: joi.string(),
    });

    const { value, error } = bodySchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      throw new HttpError(400, error.details.map((e) => e.message).join(", "));
    }

    const group = await this.groupService.create(value);
    return res.status(201).json(group);
  }

  async getGroups(req, res) {
    const querySchema = joi.object({
      offset: joi.number().integer().min(0).default(0),
      limit: joi.number().integer().min(1),
      sectionId: joi.number().integer(),
      courseCode: joi.string().trim(),
    });

    const { value, error } = querySchema.validate(req.query, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      throw new HttpError(400, error.details.map((e) => e.message).join(", "));
    }

    const groups = await this.groupService.findMany(value);
    return res.json(groups);
  }

  async getGroup(req, res) {
    const { id } = req.params;

    const group = await this.groupService.findById(id);
    if (!group) {
      throw new HttpError(404, "Group not found");
    }
    return res.json(group);
  }
}

module.exports = { GroupController };
