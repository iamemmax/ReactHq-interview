const asyncHandler = require("express-async-handler");
const userSchema = require("../model/UserSchema");
const pdf = require("html-pdf");
const fs = require("fs");
const path = require("path");

// @DESC: dashboard
exports.GetDashboard = asyncHandler(async (req, res) => {
  res.render("./admin/dashboard/dashboard", {
    user: req.user,
    layout: "./layouts/dashboardLayouts",
  });
});

//@DESC: get all users by admin
exports.getAllUser = asyncHandler(async (req, res) => {
  let users = await userSchema.find().sort({ createdAt: "-1" });
  res.render("./admin/dashboard/users", {
    layout: "./layouts/dashboardLayouts",
    users,
    deleteUser: req.flash("delete_user"),
    updateUser: req.flash("success"),
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
        .toFile("./assets/docs/users.pdf", (err, data) => {
          if (err) console.log(err);
          if (data) {
            let dataFile = fs.readFileSync(
              "./admin/dashboard/users.ejs",
              "utf8"
            );
            res.header("content-type", "application/pdf");
            res.send(dataFile);
          }
        });
    }
  );
});

exports.editUserPage = asyncHandler(async (req, res) => {
  let error = [];
  let user = await userSchema.findById(req.params.id);

  if (!user) {
    error.push({ msg: "user not found" });
    res.render("./admin/dashboard/users", {
      layout: "./layouts/dashboardLayouts",
      users,
    });
    return;
  }
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
            layout: "./layouts/dashboardLayouts",
            user,
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
