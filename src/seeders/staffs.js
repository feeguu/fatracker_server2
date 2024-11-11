const bcrypt = require("bcrypt");

const { Staff } = require("../models/staff");
const { StaffRole } = require("../models/staff-role");
const { Role } = require("../models/role");
const { Coordination } = require("../models/coordination");

const DATA = [
  {
    name: "User 1",
    email: "user1@user1.com",
    roles: ["PRINCIPAL"],
  },
  {
    name: "User 2",
    email: "user2@user2.com",
    roles: ["COORDINATOR", "PROFESSOR"],
  },
  {
    name: "User 3",
    email: "user3@user3.com",
    roles: ["PROFESSOR"],
  },
  {
    name: "User 4",
    email: "user4@user4.com",
    roles: ["COORDINATOR"],
  },
  {
    name: "User 5",
    email: "user5@user5.com",
    roles: ["COORDINATOR", "PROFESSOR"],
  },
  {
    name: "User 6",
    email: "user6@user6.com",
    roles: ["PROFESSOR"],
  },
  {
    name: "User 7",
    email: "user7@user7.com",
    roles: ["COORDINATOR"],
  },
  {
    name: "User 8",
    email: "user8@user8.com",
    roles: ["PROFESSOR"],
  },
  {
    name: "User 9",
    email: "user9@user9.com",
    roles: ["COORDINATOR", "PROFESSOR"],
  },
  {
    name: "User 10",
    email: "user10@user10.com",
    roles: ["PROFESSOR"],
  },
];

async function seedStaffs() {
  for (const staff of DATA) {
    const hashed = await bcrypt.hash(staff.email, 10);
    const [createdStaff, created] = await Staff.findOrCreate({
      where: { email: staff.email },
      defaults: {
        name: staff.name,
        email: staff.email,
        password: hashed,
      },
    });

    if (created) {
      console.log(
        `[SEED] Staff ${createdStaff.email} created with id ${createdStaff.id}`
      );
    }
  }
}

async function seedStaffRoles() {
  for (const s of DATA) {
    const staff = await Staff.findOne({ where: { email: s.email } });

    for (const r of s.roles) {
      const role = await Role.findOne({ where: { name: r } });

      const [staffRole, created] = await StaffRole.findOrCreate({
        where: {
          staffId: staff.id,
          roleId: role.id,
        },
        defaults: {
          staffId: staff.id,
          roleId: role.id,
        },
      });

      if (created) {
        console.log(`[SEED] Role ${role.name} added to ${staff.email}`);
      }
    }
  }
}

module.exports = { seedStaffs, seedStaffRoles };
