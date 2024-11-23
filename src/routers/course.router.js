const { withAuth } = require("../middlewares/with-auth");
const { withErrorHandler } = require("../middlewares/with-error-handler");
const { withRole } = require("../middlewares/with-role");
const { CourseController } = require("../controllers/course.controller");
const { CourseService } = require("../services/course.service");
const { StaffService } = require("../services/staff.service");
const { MailService } = require("../services/mail.service");

const router = require("express").Router();

const mailService = new MailService();
const staffService = new StaffService(mailService);
const courseService = new CourseService(staffService);
const courseController = new CourseController(courseService);

// Apenas cursos relacionados ao staff autenticado
router.get(
  "/",
  ...withErrorHandler(
    withAuth(),
    courseController.getCourses.bind(courseController)
  )
);

// Apenas cursos relacionados ao user autenticado, se não for deve retornar 403
router.get(
  "/:id",
  ...withErrorHandler(
    withAuth(),
    courseController.getCourseById.bind(courseController)
  )
);

router.post(
  "/",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN"]),
    courseController.createCourse.bind(courseController)
  )
);

router.patch(
  "/:id",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN"]),
    courseController.updateCourse.bind(courseController)
  )
);

router.delete(
  "/:id",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN"]),
    courseController.deleteCourse.bind(courseController)
  )
);

router.put(
  "/:id/coordinator",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN"]),
    courseController.putCourseStaff.bind(courseController)
  )
);

router.delete(
  "/:id/coordinator",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN"]),
    courseController.deleteCourseStaff.bind(courseController)
  )
);

module.exports = router;
