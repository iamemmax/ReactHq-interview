const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  getSignupPage,
  getLoginPage,
  loginAdmin,
  LogOutAdmin,
  forgetPassword,
  RequestPasswordReset,
  resetPasswordPage,
  updateNewPassword,
  adminInfo,
  updateAdminInfo,
  change_admin_password_page,
  Change_admin_Password,
} = require("../controller/admin");
const upload = require("../config/upload");
const protect = require("../config/protect");
router
  .route("/register")
  .get(getSignupPage)
  .post(upload.single("profile"), registerAdmin);
router.route("/login").get(getLoginPage).post(loginAdmin);

// @DESC forget password

router.route("/forget-password").get(forgetPassword).post(RequestPasswordReset);

// @DESC updating new password
router
  .route("/update-admin/:id")
  .get(protect, adminInfo)
  .put(upload.single("profile"), updateAdminInfo);

// .put();
router
  .route("/reset-password/:id/:token")
  .get(resetPasswordPage)
  .put(updateNewPassword);
router.get("/logout", LogOutAdmin);

router
  .route("/change_password/:id")
  .get(protect, change_admin_password_page)
  .put(Change_admin_Password);
module.exports = router;
