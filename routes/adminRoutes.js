const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  getSignupPage,
  getLoginPage,
  loginAdmin,
  LogOutAdmin,
  GetDashboard,
  forgetPassword,
  RequestPasswordReset,
  resetPasswordPage,
  updateNewPassword,
} = require("../controller/admin");
const upload = require("../config/upload");
const protect = require("../config/protect");
router
  .route("/register")
  .get(getSignupPage, protect)
  .post(upload.single("profile"), registerAdmin);
router.route("/login").get(getLoginPage).post(loginAdmin);
router.get("/logout", LogOutAdmin);

// @DESC forget password

router.route("/forget-password").get(forgetPassword).post(RequestPasswordReset);

// @DESC updating new password
router
  .route("/reset-password/:id/:token")
  .get(resetPasswordPage)
  .put(updateNewPassword);
// router.
module.exports = router;
