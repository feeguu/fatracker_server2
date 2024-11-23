const router = require("express").Router();

const { withErrorHandler } = require("../middlewares/with-error-handler");
const { withAuth } = require("../middlewares/with-auth");
const { withRole } = require("../middlewares/with-role");

const { AssignmentService } = require("../services/assignment.service");
const { SectionService } = require("../services/section.service");
const {
  AssignmentController,
} = require("../controllers/assignment.controller");
const { CourseService } = require("../services/course.service");
const { StaffService } = require("../services/staff.service");
const { StudentService } = require("../services/student.service");

const staffService = new StaffService();
const courseService = new CourseService(staffService);
const studentService = new StudentService();
const sectionService = new SectionService(
  courseService,
  staffService,
  studentService
);
const assignmentService = new AssignmentService(sectionService);
const assignmentController = new AssignmentController(assignmentService);

router.get(
  "/",
  ...withErrorHandler(
    withAuth(),
    withRole(["STAFF", "STUDENT"]),
    assignmentController.getAssignments.bind(assignmentController)
  )
);

router.get(
  "/:id",
  ...withErrorHandler(
    withAuth(),
    withRole(["STAFF", "STUDENT"]),
    assignmentController.getAssignment.bind(assignmentController)
  )
);

router.post(
  "/",
  ...withErrorHandler(
    withAuth(),
    withRole(["STAFF"]),
    assignmentController.createAssignment.bind(assignmentController)
  )
);

router.patch(
  "/:id",
  ...withErrorHandler(
    withAuth(),
    withRole(["STAFF"]),
    assignmentController.updateAssignment.bind(assignmentController)
  )
);

router.delete(
  "/:id",
  ...withErrorHandler(
    withAuth(),
    withRole(["STAFF"]),
    assignmentController.deleteAssignment.bind(assignmentController)
  )
);

module.exports = router;
