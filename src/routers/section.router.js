const { withErrorHandler } = require("../middlewares/with-error-handler");
const { withAuth } = require("../middlewares/with-auth");
const { withRole } = require("../middlewares/with-role");

const { StaffService } = require("../services/staff.service");
const { SectionService } = require("../services/section.service");
const { CourseService } = require("../services/course.service");
const { SectionController } = require("../controllers/section.controller");

const router = require("express").Router();

const staffService = new StaffService();
const courseService = new CourseService(staffService);
const sectionService = new SectionService(courseService);

const sectionController = new SectionController(sectionService);

router.get(
  "/",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN", "COORDINATOR"]),
    sectionController.getSections.bind(sectionController)
  )
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

module.exports = router;
