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
  getPdfPage,
  searchUser,
} = require("../controller/adminDashboard");

router.get("/dashboard", protect, GetDashboard);
router.get("/search", protect, searchUser);

router.route("/users").get(protect, getAllUser);
router.route("/users/:id").get(protect, editUserPage).put(updateUser);
router.delete("/users/delete/:id", deleteUser);

router.route("/users/download").get(protect, getPdfPage).post(generateUserPdf);
module.exports = router;
