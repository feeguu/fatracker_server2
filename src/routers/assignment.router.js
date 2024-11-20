const router = require("express").Router();

const { withErrorHandler } = require("../middlewares/with-error-handler");
const { withAuth } = require("../middlewares/with-auth");
const { withRole } = require("../middlewares/with-role");

const { AssignmentService } = require("../services/assignment.service");
const { SectionService } = require("../services/section.service");
const {
  AssignmentController,
} = require("../controllers/assignment.controller");

const sectionService = new SectionService();
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
