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

router.route("/users", protect, getAllUser).post(generateUserPdf);
router
  .route("/users/edit:id")
  .get(protect, editUserPage)
  .put(updateUser)
  .delete(deleteUser);
module.exports = router;
