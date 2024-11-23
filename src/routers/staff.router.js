const router = require("express").Router();

const { StaffController } = require("../controllers/staff.controller");
const { StaffService } = require("../services/staff.service");

const { withAuth, byRoles } = require("../middlewares/with-auth");
const { withErrorHandler } = require("../middlewares/with-error-handler");
const { withRole } = require("../middlewares/with-role");
const { MailService } = require("../services/mail.service");

const mailService = new MailService();
const staffService = new StaffService(mailService);
const staffController = new StaffController(staffService);

router.get(
  "/",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN", "COORDINATOR", "PRINCIPAL"]),
    staffController.getStaffs.bind(staffController)
  )
);

router.get(
  "/:id",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN", "COORDINATOR", "PRINCIPAL"]),
    staffController.getStaffById.bind(staffController)
  )
);

router.post(
  "/",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN", "COORDINATOR", "PRINCIPAL"]),
    staffController.createStaff.bind(staffController)
  )
);

router.post(
  "/:id/roles",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN", "COORDINATOR", "PRINCIPAL"]),
    staffController.addRole.bind(staffController)
  )
);

router.patch(
  "/:id",
  ...withErrorHandler(
    withAuth(),
    staffController.updateStaff.bind(staffController)
  )
);

router.delete(
  "/:id",
  ...withErrorHandler(
    withAuth(),
    withRole(["ADMIN", "COORDINATOR", "PRINCIPAL"]),
    staffController.deleteStaff.bind(staffController)
  )
);

module.exports = router;
