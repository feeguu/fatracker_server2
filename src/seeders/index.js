const { seedRoles } = require("./roles");
const { seedAdmin } = require("./admin");
const { seedCourses } = require("./courses");
const { seedStaffs, seedStaffRoles } = require("./staffs");

/**
 *
 * @param {*} adminCredentials
 * @param {string} adminCredentials.email
 * @param {string} adminCredentials.password
 */
async function seed() {
  await seedCourses();
  await seedRoles();
  await seedAdmin();
  await seedStaffs();
  await seedStaffRoles();
}

module.exports = { seed };
