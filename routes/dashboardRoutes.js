const express = require("express");
const router = express.Router();
const protect = require("../config/protect");
const {
  GetDashboard,
  getAllUser,
  editUserPage,
  updateUser,
  deleteUser,
  generateUserPdf,
} = require("../controller/adminDashboard");
router.get("/dashboard", protect, GetDashboard);

router.route("/users").get(protect, getAllUser).post(generateUserPdf);

router.route("/user/edit/:id").get(protect, editUserPage).put(updateUser);
router.delete("/users/delete/:id", deleteUser);
module.exports = router;
