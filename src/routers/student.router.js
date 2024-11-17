const router = require("express").Router();

const { withErrorHandler } = require("../middlewares/with-error-handler");
const { withAuth } = require("../middlewares/with-auth");
const { withRole } = require("../middlewares/with-role");

const { StudentController } = require("../controllers/student.controller");
const { StudentService } = require("../services/student.service");

const studentService = new StudentService();
const studentController = new StudentController(studentService);

router.get(
  "/",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN", "COORDINATOR", "PROFESSOR"]),
    studentController.getStudents.bind(studentController)
  )
);

router.get(
  "/:ra",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN", "COORDINATOR", "PROFESSOR"]),
    studentController.getStudent.bind(studentController)
  )
);

router.post(
  "/",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN", "COORDINATOR", "PROFESSOR"]),
    studentController.findOrCreateStudent.bind(studentController)
  )
);

router.patch(
  "/:ra",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN", "COORDINATOR", "PROFESSOR", "STUDENT"]),
    studentController.updateStudent.bind(studentController)
  )
);

router.delete(
  "/:ra",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN", "COORDINATOR", "PROFESSOR"]),
    studentController.deleteStudent.bind(studentController)
  )
);

router.get(
  "/:ra/sections",
  ...withErrorHandler(
    withAuth(),
    withRole(["STAFF", "STUDENT"]),
    studentController.getStudentSections.bind(studentController)
  )
);

router.post(
  "/:ra/sections",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN", "COORDINATOR", "PROFESSOR"]),
    studentController.addStudentToSection.bind(studentController)
  )
);

router.delete(
  "/:ra/sections/:sectionId",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN", "COORDINATOR", "PROFESSOR"]),
    studentController.removeStudentFromSection.bind(studentController)
  )
);

module.exports = router;
