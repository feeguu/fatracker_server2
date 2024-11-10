const { withAuth } = require("../middlewares/with-auth");
const { withErrorHandler } = require("../middlewares/with-error-handler");
const { withRole } = require("../middlewares/with-role");
const { CourseController } = require("../controllers/course.controller");
const { CourseService } = require("../services/course.service");
const { StaffService } = require("../services/staff.service");

const router = require("express").Router();

const staffService = new StaffService();
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

// Apenas cursos relacionados ao staff autenticado, se não for deve retornar 403
router.get(
  "/:id",
  ...withErrorHandler(
    withAuth(),
    courseController.getCourseById.bind(courseController)
  )
);

// Apenas ADMIN
router.post(
  "/",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN"]),
    courseController.createCourse.bind(courseController)
  )
);

// Apenas ADMIN
router.patch(
  "/:id",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN"]),
    courseController.updateCourse.bind(courseController)
  )
);

// Apenas ADMIN
router.delete(
  "/:id",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN"]),
    courseController.deleteCourse.bind(courseController)
  )
);

// Apenas ADMIN
router.put(
  "/:id/coordinator",
  ...withErrorHandler(
    withAuth(),
    courseController.putCourseStaff.bind(courseController)
  )
);

// Apenas ADMIN
router.delete(
  "/:id/coordinator",
  ...withErrorHandler(
    withAuth(),
    courseController.deleteCourseStaff.bind(courseController)
  )
);

module.exports = router;
