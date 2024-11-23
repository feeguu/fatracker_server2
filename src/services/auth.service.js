const jose = require("jose");
const bcrypt = require("bcrypt");
const Config = require("../config/config");
const { StaffService } = require("./staff.service");
const HttpError = require("../errors/HttpError");
const { Staff } = require("../models/staff");
const { Student } = require("../models/student");
const { Templates } = require("../services/mail.service");
const { getUserByEmail } = require("../utils/email");
const uuid = require("uuid");

const WRONG_CREDENTIALS = "Invalid email or password";
const OTP_TIMEOUT = 1000 * 60 * 5; // 5 minutes
const WHITELIST_TIMEOUT = 1000 * 60 * 60 * 24; // 1 day

class AuthService {
  /**
   * @param staffService {StaffService}
   * @param studentService {import("./student.service").StudentService}
   * @param mailService {import("./mail.service").MailService}
   * @param cacheService {import("./cache.service").CacheService}
   */
  constructor(staffService, studentService, mailService, cacheService) {
    this.staffService = staffService;
    this.studentService = studentService;
    this.mailService = mailService;
    this.cacheService = cacheService;
  }

  async #getUserByUsername(username) {
    const isEmail = username.includes("@"); // kinda dumb but it works

    let user = null;
    if (isEmail) {
      user = await getUserByEmail(username, true);
    } else {
      user = await this.studentService.findByRa(username, true);
    }

    return user;
  }

  async login(username, password, ip) {
    const user = await this.#getUserByUsername(username);

    if (!user) {
      throw new HttpError(400, WRONG_CREDENTIALS);
    }

    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new HttpError(400, WRONG_CREDENTIALS);
    }

    const whitelisted = this.cacheService.get(`whitelist-${user.id}-${ip}`);
    if (whitelisted) {
      return await this.#createJwt(user.id, user.ra ? "student" : "staff");
    }

    return await this.#sendTwoFactorCode(user, ip);
  }

  async #sendTwoFactorCode(user, ip) {
    const existingSession = this.cacheService.get(`2fa-${user.id}-${ip}`);
    let session = null;
    if (existingSession) {
      session = existingSession;
    } else {
      const randomSessionId = uuid.v4();
      const randomOtp = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0");

      const type = user.ra ? "student" : "staff"; // hacky way to determine type
      session = {
        id: randomSessionId,
        otp: randomOtp,
        userId: user.id,
        type,
      };
    }

    this.cacheService.set(`2fa-${user.id}-${ip}`, session, OTP_TIMEOUT);
    this.cacheService.set(`2fa-${session.id}-${ip}`, session, OTP_TIMEOUT);

    // Send OTP to e-mail
    const email = user.email;
    const subject = "Login OTP";
    const template = Templates.TWO_FACTOR;
    const url = `${Config.getInstance().frontend.url}/validate?sessionId=${
      session.id
    }&code=${session.otp}`;

    const data = { name: user.name, code: session.otp, url };

    this.mailService.sendMail(email, subject, template, data);

    return { sessionId: session.id };
  }

  async #createJwt(userId, type) {
    const config = Config.getInstance();
    const secret = new TextEncoder().encode(config.jwt.secret);

    const jwt = await new jose.SignJWT({
      id: userId,
      type,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setIssuer("fatracker")
      .setExpirationTime(config.jwt.expiresIn)
      .sign(secret);

    // Return token
    return { token: jwt, type };
  }

  async validateSession(sessionId, code, ip) {
    const sessionKey = `2fa-${sessionId}-${ip}`;
    const session = this.cacheService.get(sessionKey);

    if (!session) {
      throw new HttpError(400, "Invalid session");
    }

    if (session.otp !== code) {
      throw new HttpError(400, "Invalid code");
    }

    const userId = session.userId;
    const type = session.type;

    this.cacheService.delete(sessionKey);

    this.cacheService.set(`whitelist-${userId}-${ip}`, true, WHITELIST_TIMEOUT);
    return await this.#createJwt(userId, type);
  }

  async getUser(id, type) {
    switch (type) {
      case "staff":
        return this.staffService.findById(id);
      case "student":
        return this.studentService.findById(id);
      default:
        console.log("Invalid type", type);
        throw new Error("Unreachable branch");
    }
  }

  async resendCode(sessionId, ip) {
    const session = this.cacheService.get(`2fa-${sessionId}-${ip}`);

    if (!session) {
      throw new HttpError(400, "Invalid session");
    }

    const user = await this.getUser(session.userId, session.type);

    return await this.#sendTwoFactorCode(user, ip);
  }
}

module.exports = { AuthService };
