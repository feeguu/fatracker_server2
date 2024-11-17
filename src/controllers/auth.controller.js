const joi = require("joi");
const HttpError = require("../errors/HttpError");

class AuthController {
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

    const data = await this.authService.login(username, password);
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
