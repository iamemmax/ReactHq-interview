const adminSchema = require("../model/adminSchema");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const sharp = require("sharp");
const passport = require("passport");
const sendEmail = require("../config/email");
// const crypto = require("crypto");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// @DESC: render admin signup page
//@ACCESS: private
exports.getSignupPage = asyncHandler(async (req, res) => {
  res.render("./admin/addAdmin");
});

exports.registerAdmin = asyncHandler(async (req, res) => {
  let error = [];
  let proImg = [];
  console.log(req.body);
  let { username, email, password, password2 } = req.body;
  // @DESC:check if user filled all field
  if (!username || !email || !password || !password2) {
    console.log("fill all");
    error.push({ msg: "all field are required" });
    res.render("./admin/addAdmin", { error });
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
    res.render("./admin/addAdmin", { error });
    return;
  }
  // @DESC:check password length
  if (password.length < 5 && password2.length < 5) {
    // console.log("pass to weak");
    error.push({ msg: "password too weak" });
    res.render("./admin/addAdmin", { error });
    return;
  }
  // @DESC:check if password === password2
  if (password !== password2) {
    console.log("not match");
    error.push({ msg: "passwords not match" });
    res.render("./admin/addAdmin", { error });
    return;
  }

  // @DESC:check if admin choose a profile pix

  if (!req.file) {
    console.log("pls choose a file");
    error.push({ msg: "please choose a file" });
    res.render("./admin/addAdmin", { error });
    return;
  }

  //@DESC check if username already exist
  const userNameExist = await adminSchema.findOne({ username: username });
  if (userNameExist) {
    console.log("username exist");
    error.push({ msg: "username already link to an existing user" });
    res.render("./admin/addAdmin", { error });
    return;
  }

  //@DESC check if user email already exist
  const emailExist = await adminSchema.findOne({ email: email });
  if (emailExist) {
    console.log("email exist");
    error.push({ msg: "email already link to an existing user" });
    res.render("./admin/addAdmin", { error });
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
      res.render("./admin/addAdmin", { error });
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
          console.log(newAdmin);
          res.render("./success", { firstName: username, layout: false });
        } else {
          fs.unlinkSync(req.file.path);
          error.push({ msg: "unable to register admin" });
          res.render("./admin/addAdmin", { error });
          return;
        }
      });
    });
  } catch (error) {
    // error.push({ msg: "unable to register admin" });
    res.render("./admin/addAdmin", { error: error.message });
    return;
  }
});

// @DESC: render admin login page
//@ACCESS: private
exports.getLoginPage = asyncHandler(async (req, res) => {
  res.render("./admin/LoginAdmin");
});

// @DESC: submit admin login page
//@ACCESS: private

exports.loginAdmin = asyncHandler(async (req, res, next) => {
  let error = [];
  let { email, password } = req.body;

  if (!email || !password) {
    error.push({ msg: "all field are required" });
    res.render("./admin/LoginAdmin", { error });
    return;
  }

  // check if user enter valid email
  function validateEmail(email) {
    const regex =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
  }
  if (!validateEmail(email)) {
    error.push({ msg: "please enter valid email" });
    res.render("./admin/LoginAdmin", { error });
    return;
  }

  try {
    passport.authenticate("local", function (err, user) {
      if (err) {
        next(err);
        error.push({ msg: "Email or password not correct" });
        res.render("./admin/LoginAdmin", { error });

        return;
      }
      if (!user) {
        error.push({ msg: "Email or password not correct" });
        res.render("./admin/LoginAdmin", { error });
      }

      req.logIn(user, function (err) {
        if (err) {
          next(err);
          error.push({ msg: "Email or password not correct" });
          res.render("./admin/LoginAdmin", { error });
        }

        res.redirect("./dashboard");
      });
    })(req, res, next);
  } catch (error) {
    error.push({ msg: "Email or password not correct" });
    res.render("./admin/LoginAdmin", { error });
    return;
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
  res.render("./admin/forgetPassword");
});

exports.RequestPasswordReset = asyncHandler(async (req, res) => {
  let error = [];
  let { email } = req.body;
  if (!email) {
    error.push({ msg: "please enter your register email" });
    res.render("./admin/forgetPassword", { error });
    return;
  }
  const findUserByEmail = await adminSchema.findOne({ email: email });
  try {
    if (findUserByEmail) {
      // crypto.randomBytes(48, async (err, buffer) => {
      //   let token = buffer.toString("hex");
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
    <br style="box-sizing: border-box;"> follow this link to reset your password <a href="localhost:5000/admin/reset-password/${findUserByEmail._id}">Reset Password</a>
     <br>
     
   
    
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
      res.render("./success", { firstName: "", layout: false });
    } else {
      error.push({ msg: "user not found" });
      res.render("./admin/forgetPassword", { error });
    }
  } catch (error) {
    error.push({ msg: "something went wrong" });
    res.render("./admin/forgetPassword", { error });
  }
});

// @DESC: reset admin password
exports.resetPasswordPage = asyncHandler(async (req, res) => {
  res.render("./admin/resetPassword", { id: req.params.id });
});

exports.updateNewPassword = asyncHandler(async (req, res) => {
  let error = [];
  const user = await adminSchema.findById({ _id: req.params.id });

  // @DESC:return error if user with the above id not found
  if (!user) {
    error.push({ msg: "invalid link" });
    res.render("./admin/resetPassword", { error });
    return;
  }

  if (user) {
    let { password, password2 } = req.body;

    if (password.length < 5 && password2.length < 5) {
      error.push({ msg: "password too weak" });
      res.render("./admin/resetPassword", { error });
      return;
    }
    // @DESC:check if password === password2
    if (password !== password2) {
      console.log("not match");
      error.push({ msg: "passwords not match" });
      res.render("./admin/resetPassword", { error });
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
            res.redirect("/admin/dashboard");
          } else {
            error.push({ msg: "unable to update password" });
            res.render("./admin/resetPassword", { error });
          }
        });
      });
    } catch (error) {
      error.push({ msg: "something went wrong" });
      res.render("./admin/resetPassword", { error });
    }
  }
});

// @DESC: dashboard
exports.GetDashboard = asyncHandler(async (req, res) => {
  res.render("./admin/dashboard", {
    user: req.user,
    layout: "./layouts/dashboardLayouts",
  });
});
