const Config = require("../config/config");
const HttpError = require("../errors/HttpError");
const jose = require("jose");
const { AuthService } = require("../services/auth.service");
const { StaffService } = require("../services/staff.service");
const { JOSEError } = require("jose/errors");
const { StudentService } = require("../services/student.service");
const { MailService } = require("../services/mail.service");

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */

const mailService = new MailService();
const staffService = new StaffService(mailService);
const studentService = new StudentService();
const authService = new AuthService(staffService, studentService);

function withAuth() {
  return async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      throw new HttpError(401, "Unauthorized");
    }

    const config = Config.getInstance();
    const secret = new TextEncoder().encode(config.jwt.secret);

    try {
      const {
        payload: { id, type },
      } = await jose.jwtVerify(token, secret);

      if (type !== "staff" && type !== "student") {
        console.warn("Malformed token with type", type);
        throw new HttpError(401, "Unauthorized");
      }

      const user = await authService.getUser(id, type);

      if (!user) {
        throw new HttpError(401, "Unauthorized");
      }

      res.locals.type = type;
      res.locals.user = user;

      next();
    } catch (error) {
      if (error instanceof JOSEError) {
        throw new HttpError(401, "Unauthorized");
      }

      throw error;
    }
  };
}

module.exports = { withAuth };
