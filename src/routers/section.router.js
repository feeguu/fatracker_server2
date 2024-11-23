const { withErrorHandler } = require("../middlewares/with-error-handler");
const { withAuth } = require("../middlewares/with-auth");
const { withRole } = require("../middlewares/with-role");

const { StaffService } = require("../services/staff.service");
const { SectionService } = require("../services/section.service");
const { CourseService } = require("../services/course.service");
const { SectionController } = require("../controllers/section.controller");
const { StudentService } = require("../services/student.service");
const { MailService } = require("../services/mail.service");

const router = require("express").Router();

const mailService = new MailService();
const staffService = new StaffService(mailService);
const courseService = new CourseService(staffService);
const studentService = new StudentService();
const sectionService = new SectionService(
  courseService,
  staffService,
  studentService
);

const sectionController = new SectionController(sectionService);

router.get(
  "/",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN", "COORDINATOR"]),
    sectionController.getSections.bind(sectionController)
  )
);

router.get(
  "/:id",
  withAuth(),
  withRole(["STAFF", "STUDENT"]),
  ...withErrorHandler(sectionController.getSection.bind(sectionController))
);

router.post(
  "/",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN", "COORDINATOR"]),
    sectionController.createSection.bind(sectionController)
  )
);

router.patch(
  "/:id",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN", "COORDINATOR"]),
    sectionController.updateSection.bind(sectionController)
  )
);

router.delete(
  "/:id",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN", "COORDINATOR"]),
    sectionController.deleteSection.bind(sectionController)
  )
);

router.put(
  "/:id/professor",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN", "COORDINATOR"]),
    sectionController.assignProfessor.bind(sectionController)
  )
);

router.delete(
  "/:id/professor",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN", "COORDINATOR"]),
    sectionController.unassignProfessor.bind(sectionController)
  )
);

router.put(
  "/:id/students",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN", "COORDINATOR", "PROFESSOR"]),
    sectionController.putStudents.bind(sectionController)
  )
);

module.exports = router;
