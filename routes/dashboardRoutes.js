const express = require("express");
const router = express.Router();
const { getAllUser, generateUserPdf } = require("../controller/adminDashboard");
router.route("/users", getAllUser).post(generateUserPdf);
module.exports = router;
