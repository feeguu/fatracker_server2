const { Role } = require("../models/role");

async function seedRoles() {
  const roles = ["ADMIN", "COORDINATOR", "PRINCIPAL", "PROFESSOR"];

  for (const role of roles) {
    await Role.findOrCreate({
      where: { name: role },
      defaults: { name: role },
    });
  }
}

module.exports = { seedRoles };
