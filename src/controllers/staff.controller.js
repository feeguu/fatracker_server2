const joi = require("joi");
const HttpError = require("../errors/HttpError");

class StaffController {
  /**
   * @param {import("../services/staff.service").StaffService} staffService
   */
  constructor(staffService) {
    this.staffService = staffService;
  }

  async getStaffs(req, res) {
    /*
        Query params to filter staffs
        - roles: string
        - excludeRoles: string
     */

    const schema = joi
      .object({
        roles: joi
          .string()
          .pattern(/^[a-zA-Z]+(,[a-zA-Z]+)*$/)
          .description("List of roles to include")
          .optional(),

        excludeRoles: joi
          .string()
          .pattern(/^[a-zA-Z]+(,[a-zA-Z]+)*$/)
          .description("List of roles to exclude")
          .optional(),
      })
      .nand("roles", "excludeRoles")
      .messages({
        "object.nand":
          'Only one of "roles" or "excludeRoles" can be specified at a time.',
      });

    const {
      error,
      value: { roles, excludeRoles },
    } = schema.validate(req.query, {
      abortEarly: false,
    });
    if (error) {
      throw new HttpError(400, error.details.map((d) => d.message).join(", "));
    }

    const parsedRoles = roles
      ? roles.split(",").map((r) => r.trim().toUpperCase())
      : undefined;

    const parsedExcludeRoles = excludeRoles
      ? excludeRoles.split(",").map((r) => r.trim().toUpperCase())
      : undefined;

    const staffs = await this.staffService.findMany({
      roles: parsedRoles,
      excludeRoles: parsedExcludeRoles,
    });

    return res.status(200).json(staffs);
  }

  async getStaffById(req, res) {
    const { id } = req.params;
    const staff = await this.staffService.findById(id);
    res.status.json(staff);
  }

  async createStaff(req, res) {
    const schema = joi.object({
      name: joi.string().required(),
      email: joi.string().email().required(),
      roles: joi.array().items(joi.string()).default([]),
    });

    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      throw new HttpError(400, error.details.map((d) => d.message).join(", "));
    }
    value.roles = value.roles.map((r) => r.trim().toUpperCase());
    const staff = await this.staffService.create(value);
    res.status(201).json(staff);
  }
  async updateStaff(req, res) {
    const id = req.params.id;
    if (
      !id ||
      (Number(id) !== res.locals.user.id &&
        !res.locals.user.roles.includes("ADMIN"))
    ) {
      throw new HttpError(403, "Forbidden");
    }

    const schema = joi.object({
      name: joi.string().optional(),
      email: joi.string().email().optional(),
    });

    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      throw new HttpError(400, error.details.map((d) => d.message).join(", "));
    }

    const staff = await this.staffService.update({ id, ...value });

    return res.status(200).json(staff);
  }
  async addRole(req, res) {
    const { id } = req.params;

    const schema = joi.object({
      role: joi.string().required(),
    });

    const {
      error,
      value: { role },
    } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      throw new HttpError(400, error.details.map((d) => d.message).join(", "));
    }

    const staff = await this.staffService.addRole(id, role.toUpperCase());
    res.status(200).json(staff);
  }

  async deleteStaff(req, res) {
    const { id } = req.params;
    await this.staffService.delete(id);
    res.status(204).end();
  }
}

module.exports = { StaffController };
