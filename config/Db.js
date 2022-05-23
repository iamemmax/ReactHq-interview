const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
require("dotenv").config({ path: "../.env" });

const db = asyncHandler(async () => {
  const database = mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  if (database) {
    console.log(`database connected successfully`);
  } else {
    console.log("database error");
    process.exist(1);
  }
});
module.exports = db;
