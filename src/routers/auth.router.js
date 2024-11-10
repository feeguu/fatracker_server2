const router = require("express").Router();
const AuthController = require("../controllers/auth.controller");
const { withAuth } = require("../middlewares/with-auth");
const { withErrorHandler } = require("../middlewares/with-error-handler");
const { AuthService } = require("../services/auth.service");
const { StaffService } = require("../services/staff.service");

const staffService = new StaffService();
const authService = new AuthService(staffService);

const authController = new AuthController(authService);

router.post(
  "/login",
  ...withErrorHandler(authController.login.bind(authController))
);

router.get(
  "/me",
  ...withErrorHandler(withAuth(), authController.getUser.bind(authController))
);

module.exports = router;
