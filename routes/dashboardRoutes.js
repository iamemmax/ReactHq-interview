const express = require("express");
const router = express.Router();
const {
  getAllUser,
  generateUserPdf,
  editUser,
} = require("../controller/adminDashboard");
router.route("/users", getAllUser).post(generateUserPdf);
router.route("/users/edit:id").get(editUser).put(updateUser);
module.exports = router;
