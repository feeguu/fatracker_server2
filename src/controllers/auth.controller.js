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
          email: joi.string().required(),
          password: joi.string().required(),
        },
        { abortEarly: false }
      )
      .unknown(true);

    const {
      error,
      value: { email, password },
    } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      throw new HttpError(400, "Invalid email or password");
    }

    const token = await this.authService.login(email, password);
    return res.status(200).json({ token });
  }

  async getUser(req, res) {
    const id = res.locals.user.id;
    const user = await this.authService.getUser(id);
    return res.status(200).json(user);
  }
}

module.exports = AuthController;
