/*
  Serviço de autenticação
  TODO: Adaptar para aceitar também autenticação de alunos,
        no momento (01/11) só aceita autenticação de staff
*/

const jose = require("jose");
const bcrypt = require("bcrypt");
const Config = require("../config/config");
const { StaffService } = require("./staff.service");
const HttpError = require("../errors/HttpError");
const { Staff } = require("../models/staff");
const { Student } = require("../models/student");
const { getUserByEmail } = require("../utils/email");

const WRONG_CREDENTIALS = "Invalid email or password";

class AuthService {
  /**
   * @param staffService {StaffService}
   * @param studentService {import("./student.service").StudentService}
   */
  constructor(staffService, studentService) {
    this.staffService = staffService;
    this.studentService = studentService;
  }

  async login(username, password) {
    const isEmail = username.includes("@"); // kinda dumb but it works

    let user = null;
    if (isEmail) {
      user = await getUserByEmail(username, true);
    } else {
      user = await this.studentService.findByRa(username, true);
    }

    if (!user) {
      throw new HttpError(400, WRONG_CREDENTIALS);
    }

    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new HttpError(400, WRONG_CREDENTIALS);
    }
    // Generate token
    const config = Config.getInstance();
    const secret = new TextEncoder().encode(config.jwt.secret);

    const type = user.ra ? "student" : "staff"; // hacky way to determine type

    const jwt = await new jose.SignJWT({
      id: user.id,
      type: type,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setIssuer("fatracker")
      .setExpirationTime(config.jwt.expiresIn)
      .sign(secret);

    // Return token
    return { token: jwt, type };
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
}

module.exports = { AuthService };
