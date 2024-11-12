const { seedRoles } = require("./roles");
const { seedAdmin } = require("./admin");
const { seedCourses } = require("./courses");
const { seedStaffs, seedStaffRoles } = require("./staffs");
const { seedSections } = require("./sections");

async function seed() {
  await seedCourses();
  await seedRoles();
  await seedAdmin();
  await seedStaffs();
  await seedStaffRoles();
  await seedSections();
}

module.exports = { seed };
