const { Course } = require("../models/course");
const coursesData = [
  {
    name: "Ánalise e Desenvolvimento de Sistemas",
    code: "ADS",
    isAnnual: false,
  },
  {
    name: "AMS - Ánalise e Desenvolvimento de Sistemas",
    code: "AMS",
    isAnnual: true,
  },
  {
    name: "Desenvolvimento de Software Multiplataforma",
    code: "DSM",
    isAnnual: false,
  },
  {
    name: "Comércio Exterior",
    code: "COMEX",
    isAnnual: false,
  },
  {
    name: "Logística",
    code: "LOG",
    isAnnual: false,
  },
];

async function seedCourses() {
  for (const c of coursesData) {
    const [course, created] = await Course.findOrCreate({
      where: { code: c.code },
      defaults: c,
    });

    if (created)
      console.log(`[SEED] Course ${course.code} created with id ${course.id}`);
  }
}

module.exports = { seedCourses, coursesData };
