const { Student } = require("../models/student");

const studentsData = [
  {
    ra: "1",
    name: "Student 1",
    password: "1student",
  },
  {
    ra: "2",
    name: "Student 2",
    password: "2student",
  },
  {
    ra: "3",
    name: "Student 3",
    password: "3student",
  },
  {
    ra: "4",
    name: "Student 4",
    password: "4student",
  },
  {
    ra: "5",
    name: "Student 5",
    password: "5student",
  },
  {
    ra: "6",
    name: "Student 6",
    password: "6student",
  },
  {
    ra: "7",
    name: "Student 7",
    password: "7student",
  },
  {
    ra: "8",
    name: "Student 8",
    password: "8student",
  },
  {
    ra: "9",
    name: "Student 9",
    password: "9student",
  },
  {
    ra: "10",
    name: "Student 10",
    password: "10student",
  },
];

async function seedStudents() {
  for (const studentData of studentsData) {
    const [data, created] = await Student.findOrCreate({
      where: { ra: studentData.ra },
      defaults: studentData,
    });

    if (created)
      console.log(`[SEED] Student ${data.ra} created with id ${data.id}`);
  }
}

module.exports = { seedStudents };
