const joi = require("joi");
const dotenv = require("dotenv");

// Config Singleton
class Config {
  static #instance = null;

  /**
   * @privates
   */
  constructor() {
    if (Config.#instance) {
      return Config.#instance;
    }

    this.env = "";
    this.port = 0;
    this.db = {
      port: 0,
      host: "",
      user: "",
      password: "",
      sync: "",
      seed: false,
    };
    this.jwt = {
      secret: "",
      expiresIn: "",
    };
    this.admin = {
      email: "",
      password: "",
    };
    this.email = {
      service: "",
      username: "",
      password: "",
    };

    this.frontend = {
      url: "",
    };
  }

  /**
   * @returns {Config}
   */
  static getInstance() {
    if (Config.#instance !== null) {
      return Config.#instance;
    }

    dotenv.config();

    const configSchema = joi
      .object({
        NODE_ENV: joi
          .string()
          .valid("development", "production", "test")
          .default("development"),
        PORT: joi.number().default(3000),

        DB_PORT: joi.number().min(0).max(65535).required(),
        DB_HOST: joi.string().required(),
        DB_USER: joi.string().required(),
        DB_PASSWORD: joi.string().allow("").default(null),
        DB_NAME: joi.string().required(),
        DB_SYNC: joi
          .string()
          .trim()
          .allow("alter", "force", "none")
          .default("none"),
        DB_SEED: joi.boolean().default(false),
        JWT_SECRET: joi.string().required(),
        JWT_EXPIRES_IN: joi.string().required(),
        ADMIN_EMAIL: joi.string().when("DB_SEED", {
          is: true,
          then: joi.required(),
          otherwise: joi.optional(),
        }),
        ADMIN_PASSWORD: joi.string().when("DB_SEED", {
          is: true,
          then: joi.required(),
          otherwise: joi.optional(),
        }),
        EMAIL_SERVICE: joi.string().required(),
        EMAIL_USERNAME: joi.string().required(),
        EMAIL_PASSWORD: joi.string().required(),
        EMAIL_FROM: joi.string().required(),
        FRONTEND_URL: joi.string().uri().required(),
      })
      .unknown(true);

    const { error, value: envVars } = configSchema.validate(process.env, {
      abortEarly: false,
    });

    if (error) {
      throw new Error(
        `Config validation error: ${error.details
          .map((x) => x.message)
          .join(", ")}`
      );
    }

    const config = new Config();

    config.env = envVars.NODE_ENV;
    config.port = envVars.PORT;
    config.db = {
      port: envVars.DB_PORT,
      host: envVars.DB_HOST,
      user: envVars.DB_USER,
      password: envVars.DB_PASSWORD,
      name: envVars.DB_NAME,
      sync: envVars.DB_SYNC,
      seed: envVars.DB_SEED,
    };
    config.jwt = {
      secret: envVars.JWT_SECRET,
      expiresIn: envVars.JWT_EXPIRES_IN,
    };
    config.admin = {
      email: envVars.ADMIN_EMAIL,
      password: envVars.ADMIN_PASSWORD,
    };
    config.email = {
      service: envVars.EMAIL_SERVICE,
      username: envVars.EMAIL_USERNAME,
      password: envVars.EMAIL_PASSWORD,
      from: envVars.EMAIL_FROM,
    };
    Config.#instance = config;
    // console.log("Config instance created\n", JSON.stringify(config, null, 2));
    return Config.#instance;
  }
}

module.exports = Config;
