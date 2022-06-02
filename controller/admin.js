const adminSchema = require("../model/adminSchema");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const sharp = require("sharp");
const passport = require("passport");
const sendEmail = require("../config/email");
const crypto = require("crypto");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const { request } = require("http");

// @DESC: render admin signup page
//@ACCESS: private
exports.getSignupPage = asyncHandler(async (req, res) => {
  res.render("./admin/auth/addAdmin");
});

exports.registerAdmin = asyncHandler(async (req, res) => {
  let error = [];

  let { username, email, password, password2 } = req.body;
  // @DESC:check if user filled all field
  if (!username || !email || !password || !password2) {
    console.log("fill all");
    error.push({ msg: "all field are required" });
    res.render("./admin/auth/addAdmin", { error });
    return;
  }

  // @deDESC: check if user enter valid email
  function validateEmail(email) {
    const regex =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
  }
  if (!validateEmail(email)) {
    error.push({ msg: "please enter a valid email" });
    res.render("./admin/auth/addAdmin", { error });
    return;
  }
  // @DESC:check password length
  if (password.length < 5 && password2.length < 5) {
    // console.log("pass to weak");
    error.push({ msg: "password too weak" });
    res.render("./admin/auth/addAdmin", { error });
    return;
  }
  // @DESC:check if password === password2
  if (password !== password2) {
    console.log("not match");
    error.push({ msg: "passwords not match" });
    res.render("./admin/auth/addAdmin", { error });
    return;
  }

  // @DESC:check if admin choose a profile pix

  if (!req.file) {
    console.log("pls choose a file");
    error.push({ msg: "please choose a file" });
    res.render("./admin/auth/addAdmin", { error });
    return;
  }

  //@DESC check if username already exist
  const userNameExist = await adminSchema.findOne({ username: username });
  if (userNameExist) {
    console.log("username exist");
    error.push({ msg: "username already link to an existing user" });
    res.render("./admin/auth/addAdmin", { error });
    return;
  }

  //@DESC check if user email already exist
  const emailExist = await adminSchema.findOne({ email: email });
  if (emailExist) {
    console.log("email exist");
    error.push({ msg: "email already link to an existing user" });
    res.render("./admin/auth/addAdmin", { error });
    return;
  }

  try {
    // @DESC compress admin profile img with sharp

    await sharp(req.file.path)
      .flatten({ background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .resize(200, 200)
      .png({ quality: 90, force: true })

      .toFile(`assets/upload/${req.file.filename}.png`);
    // fs.unlinkSync(req.file.path);

    // @DESC save it to cloudinary
    let uploadImg = await cloudinary.uploader.upload(req.file.path, {
      upload_preset: "reactHq",
    });

    // @DESC if error occur when trying to upload img to cloud server
    if (!uploadImg) {
      error.push({ msg: "unable to upload profile img" });
      res.render("./admin/auth/addAdmin", { error });
      return;
    }

    let cloudImgInfo = {
      img_id: uploadImg.public_id,
      img: uploadImg.secure_url,
    };

    // @DESC delete the file path
    fs.unlinkSync(req.file.path);

    // @DESC register admin
    // @DESC hash user password
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) console.log(err);
        let newAdmin = await new adminSchema({
          username,
          email,
          password: hash,
          profile: [cloudImgInfo],
        }).save();

        if (newAdmin) {
          req.flash("reg_success", "Registration successfull !!!");
          res.redirect("/admin/login");
        } else {
          fs.unlinkSync(req.file.path);
          error.push({ msg: "unable to register admin" });
          res.render("./admin/auth/addAdmin", { error });
          return;
        }
      });
    });
  } catch (error) {
    // error.push({ msg: "unable to register admin" });
    res.render("./admin/auth/addAdmin", { error: error.message });
    return;
  }
});

// @DESC: render admin login page
//@ACCESS: private
exports.getLoginPage = asyncHandler(async (req, res) => {
  res.render("./admin/auth/LoginAdmin", {
    successReg: req.flash("reg_success"),
    pass_Reset_success: req.flash("admin_pass_success"),
  });
});

// @DESC: submit admin login page
//@ACCESS: private

exports.loginAdmin = asyncHandler(async (req, res, next) => {
  let error = [];
  let { email, password } = req.body;

  if (!email || !password) {
    error.push({ msg: "all field are required" });
    res.render("./admin/auth/LoginAdmin", {
      error,
      successReg: req.flash("reg_success"),
    });
  }

  // check if user enter valid email
  function validateEmail(email) {
    const regex =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
  }
  if (!validateEmail(email)) {
    error.push({ msg: "please enter valid email" });
    res.render("./admin/auth/LoginAdmin", {
      error,
      successReg: req.flash("reg_success"),
    });
  }

  try {
    passport.authenticate("local", function (err, user) {
      if (err) {
        next(err);
        error.push({ msg: "Email or password not correct" });
        res.render("./admin/auth/LoginAdmin", {
          error,
          successReg: req.flash("reg_success"),
        });
      }
      if (!user) {
        error.push({ msg: "Email or password not correct" });
        res.render("./admin/auth/LoginAdmin", {
          error,
          successReg: req.flash("reg_success"),
        });
      }

      req.logIn(user, function (err) {
        if (err) {
          next(err);
          error.push({ msg: "Email or password not correct" });
          res.render("./admin/auth/LoginAdmin", {
            error,
            successReg: req.flash("reg_success"),
          });
        } else {
          res.redirect("/admin/dashboard");
        }
      });
    })(req, res, next);
  } catch (error) {
    error.push({ msg: "Email or password not correct" });
    res.render("./admin/auth/LoginAdmin", {
      error,
      successReg: req.flash("reg_success"),
    });
  }
});

//@DESC logout Admin
exports.LogOutAdmin = asyncHandler(async (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("./login");
  });
  // req.flash("logout", "you have successfully logout");
});

//@DESC: forget password
exports.forgetPassword = asyncHandler(async (req, res) => {
  res.render("./admin/auth/forgetPassword", {
    passReset: req.flash("pass_success"),
  });
});

exports.RequestPasswordReset = asyncHandler(async (req, res) => {
  let error = [];
  let { email } = req.body;
  if (!email) {
    error.push({ msg: "please enter your register email" });
    res.render("./admin/auth/forgetPassword", { error });
    return;
  }
  const findUserByEmail = await adminSchema.findOne({ email: email });
  try {
    if (findUserByEmail) {
      crypto.randomBytes(48, async (err, buffer) => {
        let token = buffer.toString("hex");
        sendEmail(
          email,
          "Reset Password ",
          `<div style="box-sizing: border-box; font-family: 'Montserrat', sans-serif; font-size: 12px; margin: 0;">
  <style>
    @media screen and (max-width: 768px) {
      header {
        margin-bottom: 0px;
        padding-top: 30px;
      }
      .logo {
        width: 60%;
        padding: 50px;
        margin-bottom: 0px;
      }
      h1 {
        width: 80vw;
        font-size: 1.2rem;
        text-align: left;
        height: auto;
        padding-bottom: 50px;
        background-position: 95% 100%;
      }
    }
    
    @media screen and (max-width: 768px) {
      p {
        padding: 0px 30px;
        line-height: 1.5rem;
        font-size: 1.3rem;
      }
    }
    
    @media screen and (max-width: 768px) {
      footer span {
        width: 80%;
      }
      .footer-logo {
        width: 40%;
        padding: 30px 30px 10px 30px;
      }
    }
  </style>
<div style="box-sizing: border-box; width: 95vw; max-width: 480px; margin: auto;">
  <header style="box-sizing: border-box; display: block; margin-bottom: 40px; min-height: 60px; padding-top: 50px;">
    <img style="box-sizing: border-box; display: block; margin-bottom: 30px; margin-left: auto; margin-right: auto; padding: 30px; width: 150px;" src="http://127.0.0.1:5500/assets/img/logos/favicon.png" alt="logo">
    <hr style="border: 1px solid #e4e4e4; width:auto; box-sizing: border-box; margin-bottom: 5px; width: 100%;">
    <h1 style="box-sizing: border-box; background-image: url(https://cdn-icons-png.flaticon.com/64/3199/3199878.png); background-position: 100% 50%; background-repeat: no-repeat; color: #333; font-size: 20px; font-weight: 700; padding-top: 25px; text-align: center;"> BOOM SHAKALAK, WE'RE GLAD <br> YOU'RE HERE!</h1>
  </header>

  <p style="box-sizing: border-box; color: #636363; font-size: 17px; font-weight: 500; line-height: 25px; padding: 0px 15px; width: auto;">
    <span style="box-sizing: border-box; color: #f15a24; font-weight: 600;">Hi ${findUserByEmail.username},</span>
    <br style="box-sizing: border-box;">
    <br style="box-sizing: border-box;"> Password Reset
    <br style="box-sizing: border-box;">
    <br style="box-sizing: border-box;"> follow this link to reset your password 

     <br>
      <a href="http://localhost:5000/admin/reset-password/${findUserByEmail._id}/${token}">Reset Password</a> 
   
    
    <br style="box-sizing: border-box;">
    
    
    <br style="box-sizing: border-box;"> Regards,
    <br style="box-sizing: border-box;"> ------
    <br style="box-sizing: border-box;"> Seyi Adedibu, 
    <br style="box-sizing: border-box;"> Lead, Programs & Community
    <br style="box-sizing: border-box;"> Call Line: +2348179368606 // +2348179368462
    <br style="box-sizing: border-box;"> ReactHQ
  </p>

  <footer style="box-sizing: border-box;"> 
    <img class="footer-logo" src="http://127.0.0.1:5500/assets/img/logos/favicon.png" alt="logo" style="box-sizing: border-box; display: block; margin-left: auto; margin-right: auto; padding: 10px 10px 5px 10px; width: 100px">
    <span style="box-sizing: border-box; color: #636363; font-size: 17px; line-height: 15px; display: block; margin-bottom: 15px; text-align: center;">ReactHQ, Sprint and Spaces are Trademarks of Hydratech Software Solutions Limited</span>
    <div style="box-sizing: border-box; margin:auto; width:150px">
      <a href="https://facebook.com/react.ng" style="box-sizing: border-box; display: inline-block; margin-right: 10px;"><img style="width: 30px; height: 30px;" src="https://www.transparentpng.com/thumb/facebook-logo/facebook-icon-transparent-background-20.png" alt="facebook" style="box-sizing: border-box;"></a>
      <a href="https://www.linkedin.com/company/reactng/" style="box-sizing: border-box; display: inline-block; margin-right: 10px;"><img style="width: 30px; height: 30px;" src="https://www.transparentpng.com/thumb/linkedin/linkedin-icon-png-4.png" alt="linkedin" style="box-sizing: border-box;"></a>
      <a href="https://instagram.com/react.ng" style="box-sizing: border-box; display: inline-block;"><img style="width: 30px; height: 30px;" src="https://www.transparentpng.com/thumb/instagram/KhAbpR-instagram-free-download.png" alt="instagram" style="box-sizing: border-box;"></a>
    </div>
    <hr style="border: 1px solid #acacac; box-sizing: border-box; display:block; margin-bottom: 5px; width: 78%;">
     <p style="box-sizing: border-box; color: #636363; font-size: 15px; font-weight: 500; text-align: center;">Copyright © 2021 Hydratech Software Solutions Limited. All right reserved.</p>
  </footer>
</div>
</div>
`
        );
        let updateToken = await adminSchema.findByIdAndUpdate(
          { _id: findUserByEmail.id },
          { $set: { token: token } },
          { new: true }
        );
        if (updateToken) {
          req.flash(
            "pass_success",
            "password link as been sent to your email address"
          );
          res.redirect("/admin/forget-password");
        }
      });
    } else {
      error.push({ msg: "user not found" });
      res.render("./admin/auth/forgetPassword", { error });
    }
  } catch (error) {
    error.push({ msg: "something went wrong" });
    res.render("./admin/auth/forgetPassword", { error });
  }
});

// @DESC: reset admin password
exports.resetPasswordPage = asyncHandler(async (req, res) => {
  // res.render("./admin/auth/resetPassword", {
  //   id: req.params.id,
  //   token: req.params.token,
  // });
  res.render("./admin/auth/resetPassword", {
    id: req.params.id,
    token: req.params.token,
  });
});

exports.updateNewPassword = asyncHandler(async (req, res) => {
  let error = [];
  const user = await adminSchema.find({
    $and: [
      {
        _id: req.params.id,
        token: req.params.token,
      },
    ],
  });

  // @DESC:return error if user with the above id not found
  if (!user) {
    error.push({ msg: "invalid link" });
    res.render("./admin/auth/resetPassword", { error });
    return;
  }

  if (user) {
    let { password, password2 } = req.body;

    if (password.length < 5 && password2.length < 5) {
      error.push({ msg: "password too weak" });
      res.render("./admin/auth/resetPassword", { error });
      return;
    }
    // @DESC:check if password === password2
    if (password !== password2) {
      console.log("not match");
      error.push({ msg: "passwords not match" });
      res.render("./admin/auth/resetPassword", { error });
      return;
    }

    try {
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async (err, hash) => {
          if (err) console.log("unable to update password");
          let updatePass = await adminSchema.findByIdAndUpdate(
            { _id: req.params.id },
            {
              $set: {
                password: hash,
              },
            },
            { new: true }
          );

          if (updatePass) {
            await adminSchema.findByIdAndUpdate(
              { _id: req.params.id },
              { $set: { token: "" } },
              { new: true }
            );
            req.flash(
              "admin_pass_success",
              "admin password  change successfully"
            );
            res.redirect("/admin/login");
          } else {
            error.push({ msg: "unable to update password" });
            res.render("./admin/auth/resetPassword", { error });
          }
        });
      });
    } catch (error) {
      error.push({ msg: "something went wrong" });
      res.render("./admin/auth/resetPassword", { error });
    }
  }
});

//@DESC:Update Admin info
exports.adminInfo = asyncHandler(async (req, res) => {
  let user = await adminSchema.findById(req.params.id);

  res.render("./admin/auth/updateAdmin", {
    admin: user,
    layout: "./layouts/dashboardLayouts",
  });
});

exports.updateAdminInfo = asyncHandler(async (req, res) => {
  let { firstName, lastName, phone } = req.body;
  let admin = await adminSchema.findById(req.params.id);
  let update;

  let adminImg = {
    img_id: admin?.profile[0]?.img_id,
    img: admin?.profile[0]?.img,
  };

  if (req.file) {
    await cloudinary.uploader.destroy(admin.profile[0].img_id);
    await sharp(req?.file.path)
      .flatten({ background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .resize(200, 200)
      .png({ quality: 90, force: true });
    let uploadImg = await cloudinary.uploader.upload(req?.file?.path, {
      upload_preset: "reactHq",
    });
    let cloudImgInfo = {
      img_id: uploadImg.public_id,
      img: uploadImg.secure_url,
    };
    fs.unlinkSync(req.file.path);

    // @DESC if error occur when trying to upload img to cloud server

    // @DESC delete the file path

    update = await adminSchema.findByIdAndUpdate(
      { _id: req.user.id },
      {
        $set: {
          firstName: firstName || admin.firstName,
          lastName: lastName || admin.lastName,
          phone: phone || admin.phone,
          profile: cloudImgInfo,
        },
      },
      { new: true }
    );
  } else {
    update = await adminSchema.findByIdAndUpdate(
      { _id: req.user.id },
      {
        $set: {
          firstName: firstName || admin.firstName,
          lastName: lastName || admin.lastName,
          phone: phone || admin.phone,
          profile: adminImg,
        },
      },
      { new: true }
    );
  }
  try {
    if (update) {
      req.flash("success", "user updated successfully");
      res.redirect("/admin/users");
    } else {
      error.push({ msg: "unable to update admin" });
      res.render("./admin/dashboard/updateAdmin", {
        // layout: "./layouts/dashboardLayouts",
        user,
        admin: req.user,
        error,
      });
    }
  } catch (error) {
    console.log("something went wrong");
  }
});

//@DESC:Update Admin password
exports.change_admin_password_page = asyncHandler(async (req, res) => {
  let user = await adminSchema.findById(req.params.id);

  res.render("./admin/auth/change_password", {
    admin: user,
    layout: "./layouts/dashboardLayouts",
  });
});

exports.Change_admin_Password = asyncHandler(async (req, res) => {
  let error = [];
  const admin = await adminSchema.findById(req.params.id);
  let { oldpassword, password, password1 } = req.body;
  console.log(oldpassword, password, password1);
  if (!oldpassword || !password || !password1) {
    error.push({ msg: "all field are required" });
    res.render("./admin/auth/change_password", {
      admin,
      error,
      layout: "./layouts/dashboardLayouts",
    });
  }
  if (password.length < 5 && password1.length < 5) {
    // console.log("pass to weak");
    error.push({ msg: "password too weak" });
    res.render("./admin/auth/change_password", {
      admin,
      error,
      layout: "./layouts/dashboardLayouts",
    });
    return;
  }
  // @DESC:check if password === password2
  if (password !== password1) {
    console.log("not match");
    error.push({ msg: "passwords not match" });
    res.render("./admin/auth/change_password", {
      admin,
      error,
      layout: "./layouts/dashboardLayouts",
    });
  }

  if (admin) {
    try {
      bcrypt.compare(oldpassword, admin.password, (err, isMatch) => {
        if (!isMatch) {
          error.push({ msg: "old password not matched" });
          res.render("./admin/auth/change_password", {
            admin,
            error,
            layout: "./layouts/dashboardLayouts",
          });
        }
        if (isMatch) {
          bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, async (err, hash) => {
              if (isMatch.password === hash) {
                error.push({ msg: "please choose new password" });
                res.render("./admin/auth/change_password", {
                  admin,
                  error,
                  layout: "./layouts/dashboardLayouts",
                });
                return;
              }
              let update = await adminSchema.findOneAndUpdate(
                { _id: req.params.id },
                { $set: { password: hash || admin.password } },
                { new: true }
              );
              if (!update) {
                // res.send("unable to update pass")
                error.push({ msg: "unable to update password" });

                res.render("./admin/auth/change_password", {
                  admin,
                  error,
                  layout: "./layouts/dashboardLayouts",
                });
              } else {
                req.flash(
                  "pass_change_success",
                  "password changed successfully"
                );
                res.redirect("/admin/users");
              }
            });
          });
        }
      });
    } catch (error) {
      console.log("somthing went wrong");
    }
  } else {
    error.push({ msg: "users not found" });

    res.render("./admin/auth/change_password", {
      admin,
      error,
      layout: "./layouts/dashboardLayouts",
    });
  }
});

// exports.updateAdminInfo = asyncHandler(async (req, res) => {
//  let { firstName, lastName, phone } = req.body;
//  let admin = await adminSchema.findById(req.params.id);

// //  let adminImg = {
// //    img_id: admin?.profile[0]?.img_id,
// //    img: admin?.profile[0]?.img,
// //  };

// if(req.file)
// })
