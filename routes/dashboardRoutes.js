const express = require("express");
const router = express.Router();
const protect = require("../config/protect");
const {
  GetDashboard,
  searchUser,
  getAllUser,
  searchUser,
  editUserPage,
  updateUser,
  deleteUser,
} = require("../controller/adminDashboard");

router.get("/dashboard", protect, GetDashboard);
router.route("/users").get(protect, getAllUser);
router.get("/search", protect, searchUser);
<<<<<<< HEAD
router.route("/users").get(protect, getAllUser);
=======

>>>>>>> dashboard
router.route("/users/:id").get(protect, editUserPage).put(updateUser);
router.delete("/users/delete/:id", deleteUser);

module.exports = router;
