const { seedRoles } = require("./roles");
const { seedAdmin } = require("./admin");

/**
 *
 * @param {*} adminCredentials
 * @param {string} adminCredentials.email
 * @param {string} adminCredentials.password
 */
async function seed() {
  await seedRoles();
  await seedAdmin();
}

module.exports = { seed };
