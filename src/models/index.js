const { sequelize } = require("../config/sequelize");

const { Role } = require("./role");
const { Staff } = require("./staff");
const { StaffRole } = require("./staff-role");
const { Course } = require("./course");
const { Coordination } = require("./coordination");
const { Section } = require("./section");
const { Teaching } = require("./teaching");
const { Student } = require("./student");
const { StudentSection } = require("./student-section");
const { Group } = require("./group");
const { StudentGroup } = require("./student-group");
const { Assignment } = require("./assignment");

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
  onDelete: "SET NULL",
});

Section.hasOne(Teaching, {
  foreignKey: "sectionId",
  as: "teaching",
  onDelete: "CASCADE",
});

//#endregion

//#region Student-Section associations

Student.hasMany(StudentSection, {
  foreignKey: "studentId",
  as: "studentSections",
  onDelete: "CASCADE",
});
StudentSection.belongsTo(Student, {
  foreignKey: "studentId",
  as: "student",
});

Section.hasMany(StudentSection, {
  foreignKey: "sectionId",
  as: "studentSections",
  onDelete: "CASCADE",
});
StudentSection.belongsTo(Section, {
  foreignKey: "sectionId",
  as: "section",
});

//#endregion

//#region Group associations

Section.hasMany(Group, {
  foreignKey: "sectionId",
  as: "groups",
  onDelete: "CASCADE",
});

Group.belongsTo(Section, {
  foreignKey: "sectionId",
  as: "section",
});

Group.hasMany(StudentGroup, {
  foreignKey: "groupId",
  as: "studentGroups",
  onDelete: "CASCADE",
});

StudentGroup.belongsTo(Group, {
  foreignKey: "groupId",
  as: "group",
});

Student.hasMany(StudentGroup, {
  foreignKey: "studentId",
  as: "studentGroups",
  onDelete: "CASCADE",
});

StudentGroup.belongsTo(Student, {
  foreignKey: "studentId",
  as: "student",
});

//#endregion

//#region Assignment
Assignment.belongsTo(Section, {
  foreignKey: "sectionId",
  as: "section",
});

Section.hasMany(Assignment, {
  foreignKey: "sectionId",
  as: "assignments",
  onDelete: "CASCADE",
});
//#endregion

async function init() {
  switch (config.db.sync) {
    case "alter":
      await sequelize.sync({ alter: true });
      break;
    case "force":
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
      await sequelize.sync({ force: true });
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
      console.log("FORCED: Database synchronized");
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
  .catch(async (error) => {
    console.error("Error while initializing database", error.parent.code);
    console.log("Error: ", error);
    if (config.db.sync !== "force") {
      console.log("Try to force sync the database");
    }
  });
