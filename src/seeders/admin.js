const { Staff } = require("../models/staff");
const bcrypt = require("bcrypt");
const Config = require("../config/config");
const { Role } = require("../models/role");
const { StaffRole } = require("../models/staff-role");
async function seedAdmin() {
  const config = Config.getInstance();

  const hashedPassword = await bcrypt.hash(config.admin.password, 10);
  const email = config.admin.email;

  const [staff, created] = await Staff.findOrCreate({
    where: { email },
    defaults: { name: "Admin", email, password: hashedPassword },
  });

  if (!staff.roles.includes("ADMIN")) {
    const role = await Role.findOne({ where: { name: "ADMIN" } });
    const staffRole = await StaffRole.create({
      staffId: staff.id,
      roleId: role.id,
    });
  }
}

module.exports = { seedAdmin };
