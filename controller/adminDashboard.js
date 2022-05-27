const asyncHandler = require("express-async-handler");
const userSchema = require("../model/UserSchema");
const pdf = require("html-pdf");
const fs = require("fs");
const path = require("path");
//@DESC: get all users by admin
exports.getAllUser = asyncHandler(async (req, res) => {
  let users = await userSchema.find().sort({ createdAt: "-1" });
  res.render("./admin/dashboard/users", {
    layout: "./layouts/dashboardLayouts",
    users,
  });
});

exports.generateUserPdf = asyncHandler(async (req, res) => {
  let users = await userSchema.find().sort({ createdAt: "-1" });
  const option = { format: "A4" };
  res.render(
    "./admin/dashboard/users",
    {
      layout: "./layouts/dashboardLayouts",
      users,
    },
    (err, html) => {
      pdf
        .create(html, option)
        .toFile(`assets/docs/users/${Date.now()}`, (err, data) => {});
    }
  );
});
