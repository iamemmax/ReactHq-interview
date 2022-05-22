const express = require("express");
const router = express.Router();
const { getHomePage, submitForm } = require("../controller/user");

router.get("/", getHomePage);
router.post("/signup", submitForm);

module.exports = router;
