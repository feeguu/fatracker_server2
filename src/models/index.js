const { sequelize } = require("../config/sequelize");
const { Role } = require("./role");
const { Staff } = require("./staff");
const { StaffRole } = require("./staff-role");

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

// sequelize.sync({ force: true });
