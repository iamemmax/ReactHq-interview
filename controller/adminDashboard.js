const asyncHandler = require("express-async-handler");
const userSchema = require("../model/UserSchema");
const adminSchema = require("../model/adminSchema");
const fs = require("fs");
const path = require("path");

// @DESC: dashboard
exports.GetDashboard = asyncHandler(async (req, res) => {
  res.render("./admin/dashboard/dashboard", {
    // user: req.user,
    layout: "./layouts/dashboardLayouts",
    admin: req.user,
  });
});

//@DESC: get all users by admin
exports.getAllUser = asyncHandler(async (req, res) => {
  let users = await userSchema.find().sort({ createdAt: "-1" });

  res.render("./admin/dashboard/users", {
    layout: "./layouts/dashboardLayouts",
    users,
    admin: req.user,
    deleteUser: req.flash("delete_user"),
    updateUser: req.flash("success"),
  });
});

//@DESC: get update user page

exports.editUserPage = asyncHandler(async (req, res) => {
  let user = await userSchema.findById(req.params.id);

  res.render("./admin/dashboard/editUser", {
    // layout: "./layouts/dashboardLayouts",
    user,
    admin: req.user,
  });
});
//@DESC:update user
exports.updateUser = async (req, res) => {
  let user = await userSchema.findById(req.params.id);
  let error = [];

  let { firstName, lastName, email, phone, acct_No, course } = req.body;

  //  @desc check if user fill all fields
  if (!firstName || !lastName || !email || !phone || !acct_No || !course) {
    error.push({ msg: "all field are required" });

    return;
  }

  // @desc check if user enter valid email
  // function validateEmail(email) {
  //   const regex =
  //     /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  //   return regex.test(email);
  // }
  // if (!validateEmail(email)) {
  //   error.push({ msg: "please enter a valid email" });
  //   res.render("./admin/dashboard/editUser", {
  //     layout: "./layouts/dashboardLayouts",
  //     user,
  //     error,
  //   });
  //   return;
  // }

  try {
    await userSchema.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          email: email || user.email,
          phone: phone || user.phone,
          acct_No: acct_No || user.acct_No,
          course: course || user.course,
        },
      },
      { new: true },
      (err, data) => {
        if (err) {
          error.push({ msg: "unable to update user" });
          res.render("./admin/dashboard/editUser", {
            // layout: "./layouts/dashboardLayouts",
            user,
            admin: req.user,

            error,
          });
        }
        if (data) {
          req.flash("success", "user updated successfully");
          res.redirect("/admin/users");
        }
      }
    );
  } catch (error) {
    console.log(error.message);
  }
};

//@DESC: Delete user
exports.deleteUser = asyncHandler(async (req, res) => {
  let deleteUserInfo = await userSchema.findByIdAndDelete(req.params.id);
  if (deleteUserInfo) {
    req.flash("delete_user", "User deleted successfully");
    res.redirect("/admin/users");
  } else {
    res.render("./admin/dashboard/users", {
      layout: "./layouts/dashboardLayouts",
      users,
    });
  }
});

//@DESC search user
exports.searchUser = asyncHandler(async (req, res) => {
  let keyword = req.query.user
    ? {
        $or: [
          { firstName: { $regex: req.query.user, $options: "i" } },
          { lastName: { $regex: req.query.user, $options: "i" } },
          { email: { $regex: req.query.user, $options: "i" } },
          // { acct_No: { $regex: req.query.user.toString() } },
        ],
      }
    : {};
  const users = await userSchema.find(keyword);
  console.log(users);

  res.render("./admin/dashboard/search", {
    layout: "./layouts/dashboardLayouts",
    users,
    admin: req.user,
  });
});
