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
router.route("/login").get(protect, getLoginPage).post(loginAdmin);
router.get("/logout", protect, LogOutAdmin);

router.get("/dashboard", protect, GetDashboard);

// @DESC forget password

router
  .route("/forget-password")
  .get(protect, forgetPassword)
  .post(protect, RequestPasswordReset);

// @DESC updating new password
router
  .route("/reset-password/:id")
  .get(protect, resetPasswordPage)
  .put(protect, updateNewPassword);
// router.
module.exports = router;
