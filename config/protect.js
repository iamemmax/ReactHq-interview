// const adminSchema = require("../model")
module.exports = function protect(req, res, next) {
  if (req.isAuthenticated()) {
    if (user.roles === "admin") {
      return next();
    } else {
      res.redirect("/admin/login");
    }
  } else {
    res.redirect("/admin/login");
  }
};