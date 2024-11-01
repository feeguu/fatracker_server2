const router = require("express").Router();

const { StaffController } = require("../controllers/staff.controller");
const { StaffService } = require("../services/staff.service");

const { withAuth, byRoles } = require("../middleware/with-auth");
const { withErrorHandler } = require("../middleware/with-error-handler");

const staffService = new StaffService();
const staffController = new StaffController(staffService);

router.get(
  "/",
  ...withErrorHandler(
    withAuth(byRoles(["ADMIN", "COORDINATOR", "PRINCIPAL"])),
    staffController.getStaffs.bind(staffController)
  )
);

router.get(
  "/:id",
  ...withErrorHandler(
    withAuth(byRoles(["ADMIN", "COORDINATOR", "PRINCIPAL"])),
    staffController.getStaffById.bind(staffController)
  )
);

router.post(
  "/",
  ...withErrorHandler(
    withAuth(byRoles(["ADMIN"])),
    staffController.createStaff.bind(staffController)
  )
);

router.post(
  "/:id/roles",
  ...withErrorHandler(
    withAuth(byRoles(["ADMIN", "PRINCIPAL", "COORDINATOR"])),
    staffController.addRole.bind(staffController)
  )
);

router.patch(
  "/:id",
  ...withErrorHandler(
    withAuth(
      (req, user) =>
        user.id === Number(req.params.id) || user.roles.includes("ADMIN")
    ),
    staffController.updateStaff.bind(staffController)
  )
);

router.delete(
  "/:id",
  ...withErrorHandler(
    withAuth(byRoles(["ADMIN"])),
    staffController.deleteStaff.bind(staffController)
  )
);

module.exports = router;
