const express = require("express");
const router = express.Router();
const { getHomePage, submitForm } = require("../controller/user");

router.route("/").get(getHomePage).post(submitForm);
// router.post("/signup", submitForm);

module.exports = router;
