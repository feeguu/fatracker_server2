const router = require("express").Router();
const AuthController = require("../controllers/auth.controller");
const { withAuth } = require("../middlewares/with-auth");
const { withErrorHandler } = require("../middlewares/with-error-handler");
const { AuthService } = require("../services/auth.service");
const { CacheService } = require("../services/cache.service");
const { MailService } = require("../services/mail.service");
const { StaffService } = require("../services/staff.service");
const { StudentService } = require("../services/student.service");

const mailService = new MailService();
const staffService = new StaffService(mailService);
const studentService = new StudentService();
const cacheService = new CacheService();
const authService = new AuthService(
  staffService,
  studentService,
  mailService,
  cacheService
);

const authController = new AuthController(authService);

router.post(
  "/login",
  ...withErrorHandler(authController.login.bind(authController))
);

router.post(
  "/validate/:sessionId",
  ...withErrorHandler(authController.validateSession.bind(authController))
);

router.post(
  "/resend/:sessionId",
  ...withErrorHandler(authController.resendCode.bind(authController))
);

router.get(
  "/me",
  ...withErrorHandler(withAuth(), authController.getUser.bind(authController))
);

module.exports = router;
