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

class AuthService {
  /**
   * @param staffService {StaffService}
   */
  constructor(staffService) {
    this.staffService = staffService;
  }

  async login(email, password) {
    console.log(email);
    // Find user by email
    const staff = await this.staffService.findByEmail(email, true);

    if (!staff) {
      throw new HttpError(400, "Invalid email or password");
    }

    console.log(password, staff.password);
    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, staff.password);

    if (!isPasswordCorrect) {
      throw new HttpError(400, "Invalid email or password");
    }
    // Generate token
    const config = Config.getInstance();
    const secret = new TextEncoder().encode(config.jwt.secret);

    const jwt = await new jose.SignJWT({
      id: staff.id,
      type: "staff",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setIssuer("fatracker")
      .setExpirationTime(config.jwt.expiresIn)
      .sign(secret);

    // Return token
    return jwt;
  }

  async getUser(id) {
    return this.staffService.findById(id);
  }
}

module.exports = { AuthService };
