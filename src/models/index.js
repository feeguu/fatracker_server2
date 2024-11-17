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
const { StudentSection } = require("./student-section");

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

const resetIndexesKeys = async () => {
  try {
    const [results] = await sequelize.query(`
          SELECT TABLE_NAME, INDEX_NAME
          FROM INFORMATION_SCHEMA.STATISTICS
          WHERE TABLE_SCHEMA = '${sequelize.config.database}';
      `);

    for (const { TABLE_NAME, INDEX_NAME } of results) {
      if (INDEX_NAME !== "PRIMARY") {
        console.log(`Removing index ${INDEX_NAME} from table ${TABLE_NAME}`);
        await sequelize.query(
          `ALTER TABLE \`${TABLE_NAME}\` DROP INDEX \`${INDEX_NAME}\``
        );
      }
    }

    console.log("All non-primary indexes removed!");
  } catch (error) {
    console.error("Error while removing indexes:", error);
  }
};

init()
  .then(() => {
    console.log("Database initialized");
  })
  .catch((err) => {
    console.error("Error while initializing database:", err);
    if (err.code === "ER_TOO_MANY_KEYS") {
      console.warn("Forcing reset of indexes keys");
      resetIndexesKeys().then(() => {
        init().catch((err) => {
          console.error("Error while reinitializing database:", err);
        });
      });
    } else {
      throw err;
    }
  });
