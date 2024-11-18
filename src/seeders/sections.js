const { Course } = require("../models/course");
const { Section } = require("../models/section");

const DATA = [
  {
    courseId: 1,
    period: "MORNING",
    year: 2021,
    semester: 1,
    yearSemester: "1",
  },
  {
    courseId: 2,
    period: "AFTERNOON",
    year: 2021,
    semester: 1,
    yearSemester: "1",
  },
  {
    courseId: 3,
    period: "NIGHT",
    year: 2021,
    semester: 1,
    yearSemester: "1",
  },
  {
    courseId: 4,
    period: "MORNING",
    year: 2021,
    semester: 2,
    yearSemester: "2",
  },
  {
    courseId: 5,
    period: "AFTERNOON",
    year: 2021,
    semester: 2,
    yearSemester: "2",
  },
  {
    courseId: 4,
    period: "NIGHT",
    year: 2021,
    semester: 2,
    yearSemester: "2",
  },
  {
    courseId: 3,
    period: "MORNING",
    year: 2022,
    semester: 1,
    yearSemester: "1",
  },
  {
    courseId: 2,
    period: "AFTERNOON",
    year: 2022,
    semester: 1,
    yearSemester: "1",
  },
  {
    courseId: 1,
    period: "NIGHT",
    year: 2022,
    semester: 1,
    yearSemester: "1",
  },
  {
    courseId: 1,
    period: "MORNING",
    year: 2022,
    semester: 2,
    yearSemester: "2",
  },
  {
    courseId: 2,
    period: "AFTERNOON",
    year: 2022,
    semester: 2,
    yearSemester: "2",
  },
  {
    courseId: 3,
    period: "NIGHT",
    year: 2022,
    semester: 2,
    yearSemester: "2",
  },
];

async function seedSections() {
  for (const section of DATA) {
    const course = await Course.findByPk(section.courseId);
    if (!course) {
      console.error(
        `[SEED] Trying to create section to Course ${section.courseId} but it does not exist`
      );
    }

    const [createdSection, created] = await Section.findOrCreate({
      where: {
        courseId: section.courseId,
        year: section.year,
        semester: section.semester,
        yearSemester: section.yearSemester,
      },
      defaults: {
        period: section.period,
        courseId: section.courseId,
        year: section.year,
        yearSemester: section.yearSemester,
        semester: section.semester,
      },
    });

    if (created) {
      console.log(`[SEED] Section ${createdSection.id} created`);
    }
  }
}

module.exports = { seedSections };
