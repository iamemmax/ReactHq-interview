// const adminSchema = require("../model")
module.exports = function protect(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/admin/login");
  }
};
