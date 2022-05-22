const express = require("express");
const router = express.Router();
const { getHomePage, submitForm } = require("../controller/user");

router.route("/").get(getHomePage).post(submitForm);

module.exports = router;
