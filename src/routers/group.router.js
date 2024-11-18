const router = require("express").Router();
const { withErrorHandler } = require("../middlewares/with-error-handler");
const { withAuth } = require("../middlewares/with-auth");
const { withRole } = require("../middlewares/with-role");
const { GroupController } = require("../controllers/group.controller");
const { GroupService } = require("../services/group.service");
const { StudentService } = require("../services/student.service");
const { SectionService } = require("../services/section.service");

const sectionService = new SectionService();
const studentService = new StudentService();
const groupService = new GroupService(sectionService, studentService);
const groupController = new GroupController(groupService);

router.get(
  "/",
  ...withErrorHandler(
    withAuth(),
    withRole(["STAFF", "STUDENT"]),
    groupController.getGroups.bind(groupController)
  )
);

router.post(
  "/",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN", "PROFESSOR"]),
    groupController.createGroup.bind(groupController)
  )
);

router.get(
  "/:id",
  ...withErrorHandler(
    withAuth(),
    withRole(["STAFF", "STUDENT"]),
    groupController.getGroup.bind(groupController)
  )
);

// router.patch(
//   "/:id",
//   ...withErrorHandler(
//     withAuth(),
//     withRole(["ADMIN", "PROFESSOR"]),
//     groupController.updateGroup.bind(groupController)
//   )
// );

// router.delete(
//   "/:id",
//   ...withErrorHandler(
//     withAuth(),
//     withRole(["ADMIN", "PROFESSOR"]),
//     groupController.deleteGroup.bind(groupController)
//   )
// );

// router.post(
//   "/:id/students",
//   ...withErrorHandler(
//     withAuth(),
//     withRole(["ADMIN", "PROFESSOR"]),
//     groupController.addStudent.bind(groupController)
//   )
// );

// router.delete(
//   "/:id/students/:studentId",
//   ...withErrorHandler(
//     withAuth(),
//     withRole(["ADMIN", "PROFESSOR"]),
//     groupController.removeStudent.bind(groupController)
//   )
// );

module.exports = router;
