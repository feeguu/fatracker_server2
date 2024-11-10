const { sequelize } = require("../config/sequelize");
const { Role } = require("./role");
const { Staff } = require("./staff");
const { StaffRole } = require("./staff-role");
const { Course } = require("./course");
const { Coordination } = require("./coordination");

const { seed } = require("../seeders");

const Config = require("../config/config");

const config = Config.getInstance();

StaffRole.belongsTo(Staff, { foreignKey: "staffId", as: "staff" });
StaffRole.belongsTo(Role, { foreignKey: "roleId", as: "role" });

Staff.hasMany(StaffRole, {
  foreignKey: "staffId",
  as: "staffRoles",
  onDelete: "CASCADE",
});
Role.hasMany(StaffRole, {
  foreignKey: "roleId",
  as: "staffRoles",
  onDelete: "CASCADE",
});

Coordination.belongsTo(StaffRole, {
  foreignKey: "staffRoleId",
  as: "staffRole",
});

StaffRole.hasMany(Coordination, {
  foreignKey: "staffRoleId",
  as: "coordinations",
  onDelete: "CASCADE",
});

Course.belongsTo(Coordination, {
  foreignKey: "coordinationId",
  as: "coordination",
});

Coordination.hasMany(Course, {
  foreignKey: "coordinationId",
  as: "courses",
  onDelete: "SET NULL",
});

async function init() {
  switch (config.db.sync) {
    case "alter":
      await sequelize.sync({ alter: true });
      break;
    case "force":
      await sequelize.sync({ force: true });
      break;
  }
  if (config.db.seed) {
    await seed();
  }
}

init();
