const HttpError = require("../errors/HttpError");

const withRole = (roles) => async (req, res, next) => {
  const { user } = res.locals;
  if (!user.roles.some((r) => roles.includes(r))) {
    console.log("roles:", user.roles);
    throw new HttpError(403, "Forbidden");
  }
  next();
};

module.exports = { withRole };
