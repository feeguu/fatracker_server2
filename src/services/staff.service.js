const { Op } = require("sequelize");
const { sequelize } = require("../config/sequelize");
const { Role } = require("../models/role");
const { Staff } = require("../models/staff");
const { StaffRole } = require("../models/staff-role");
const HttpError = require("../errors/HttpError");
const bcrypt = require("bcrypt");
const { getUserByEmail } = require("../utils/email");
class StaffService {
  /**
   * @param {Object} param0
   * @param {Array<string> | undefined} param0.roles
   * @param {Array<string> | undefined} param0.excludeRoles
   */
  async findMany({ roles, excludeRoles }) {
    if (roles && excludeRoles) {
      // SHOULD BE UNREACHABLE
      throw new Error(
        'Only one of "roles" or "excludeRoles" can be specified at a time.'
      );
    }

    if (roles) {
      return Staff.findAll({
        where: {
          "$staffRoles.role.name$": {
            [Op.in]: roles,
          },
        },
      });
    }

    if (excludeRoles) {
      return Staff.findAll({
        where: {
          "$staffRoles.role.name$": {
            [Op.notIn]: excludeRoles,
          },
        },
      });
    }

    return Staff.findAll();
  }
  async findByEmail(email, includePassword = false) {
    if (includePassword) {
      return Staff.scope("withPassword").findOne({
        where: {
          email,
        },
      });
    }

    return await Staff.findOne({
      where: {
        email,
      },
    });
  }

  async findById(id, includePassword = false) {
    if (includePassword) {
      return Staff.scope("withPassword").findByPk(id);
    }

    return Staff.findByPk(id);
  }

  /**
   * @param {Object} param0
   * @param {string} param0.name
   * @param {string} param0.email
   * @param {Array<string>} param0.roles
   */
  async create({ name, email, roles: rolesNames }) {
    const conflict = await getUserByEmail(email);
    if (conflict) {
      throw new HttpError(409, "Email already in use");
    }

    // TODO: isso era pra ser gerada automatica e mandada por email
    // No momento pega o primeiro nome em minuscula e sem acento
    const password = name
      .split(" ")[0]
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await sequelize.transaction(async (t) => {
      const staff = await Staff.create(
        { name, email, password: hashedPassword },
        { transaction: t }
      );

      const roles = [];

      for (const roleName of rolesNames) {
        const role = await Role.findOne({
          where: { name: roleName.toUpperCase() },
          transaction: t,
        });

        if (!role) {
          throw new HttpError(404, `Role ${roleName} not found`);
        }

        roles.push(role);
      }

      const staffRoles = roles.map((role) => ({
        staffId: staff.id,
        roleId: role.id,
      }));

      await StaffRole.bulkCreate(staffRoles, {
        transaction: t,
        validate: true,
      });
      await staff.reload({ transaction: t });
      return staff;
    });

    return staff;
  }

  async addRole(staffId, roleName) {
    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      throw new HttpError(404, "Staff not found");
    }

    const role = await Role.findOne({
      where: { name: roleName.toUpperCase() },
    });

    if (!role) {
      throw new HttpError(404, "Role not found");
    }

    const conflict = await StaffRole.findOne({
      where: {
        staffId,
        roleId: role.id,
      },
    });

    if (!conflict) {
      const staffRole = await StaffRole.create({
        staffId,
        roleId: role.id,
      });

      await staff.reload();
    }

    return staff;
  }

  async update({ id, name, email }) {
    const staff = await Staff.findByPk(id);
    if (!staff) {
      throw new HttpError(404, "Staff not found");
    }

    if (name) staff.name = name;
    if (email) {
      const conflict = await getUserByEmail(email);
      if (conflict && conflict.id !== id) {
        throw new HttpError(409, "Email already in use");
      }

      staff.email = email;
    }

    await staff.save();
    return staff;
  }

  async delete(id) {
    const staff = await Staff.findByPk(id);
    if (!staff) {
      throw new HttpError(404, "Staff not found");
    }

    await staff.destroy();
  }
}

module.exports = { StaffService };
