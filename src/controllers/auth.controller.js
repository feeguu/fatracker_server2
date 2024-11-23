const joi = require("joi");
const HttpError = require("../errors/HttpError");

class AuthController {
  /**
   *
   * @param {import("../services/auth.service").AuthService} authService
   */
  constructor(authService) {
    this.authService = authService;
  }

  async login(req, res) {
    const schema = joi
      .object(
        {
          username: joi.string().required(), // can be email or ra
          password: joi.string().required(),
        },
        { abortEarly: false, allowUnknown: true }
      )
      .unknown(true);

    const {
      error,
      value: { username, password },
    } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });

    if (error) {
      throw new HttpError(400, "Invalid credentials");
    }
    console.log("Login request", username, password, req.ip);
    const data = await this.authService.login(username, password, req.ip);
    return res.status(200).json(data);
  }

  async validateSession(req, res) {
    const schema = joi.object({
      code: joi.string().required(),
    });

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      throw new HttpError(400, error.details.map((e) => e.message).join(", "));
    }

    const data = await this.authService.validateSession(
      req.params.sessionId,
      value.code,
      req.ip
    );
    return res.status(200).json(data);
  }

  async resendCode(req, res) {
    const schema = joi.object({
      sessionId: joi.string().uuid().required(),
    });

    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      throw new HttpError(400, error.details.map((e) => e.message).join(", "));
    }

    const data = await this.authService.resendCode(value.sessionId, req.ip);
    return res.status(200).json(data);
  }

  async getUser(req, res) {
    const id = res.locals.user.id;
    const type = res.locals.type;
    const user = await this.authService.getUser(id, type);
    return res.status(200).json(user);
  }
}

module.exports = AuthController;
