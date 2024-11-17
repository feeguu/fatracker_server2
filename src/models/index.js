const { sequelize } = require("../config/sequelize");
const { Role } = require("./role");
const { Staff } = require("./staff");
const { StaffRole } = require("./staff-role");
const { Course } = require("./course");
const { Coordination } = require("./coordination");
const { Section } = require("./section");
const { Teaching } = require("./teaching");
const { Student } = require("./student");

const Config = require("../config/config");
const { seed } = require("../seeders");

const config = Config.getInstance();

//#region Roles asscociations

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
//#endregion

//#region Coordination associations

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

Coordination.hasOne(Course, {
  foreignKey: "coordinationId",
  as: "course",
  onDelete: "SET NULL",
});
//#endregion

//#region Section-Course associations

Section.belongsTo(Course, {
  foreignKey: "courseId",
  as: "course",
});

Course.hasMany(Section, {
  foreignKey: "courseId",
  as: "sections",
  onDelete: "CASCADE",
});
//#endregion

//#region Professor-Section associations

Teaching.belongsTo(StaffRole, {
  foreignKey: "staffRoleId",
  as: "staffRole",
});

StaffRole.hasMany(Teaching, {
  foreignKey: "staffRoleId",
  as: "teachings",
  onDelete: "CASCADE",
});

Teaching.belongsTo(Section, {
  foreignKey: "sectionId",
  as: "section",
});

Section.hasOne(Teaching, {
  foreignKey: "sectionId",
  as: "teaching",
  onDelete: "SET NULL",
});

//#endregion

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

init()
  .then(() => {
    console.log("Database initialized");
  })
  .catch((err) => {
    console.error(err);
  });
