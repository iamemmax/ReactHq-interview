const User = require("../model/UserSchema");
const asyncHandler = require("express-async-handler");
const axios = require("axios");
const sendEmail = require("../config/email");

// @access: PUBLIC
// @desc: Rendering index.html
exports.getHomePage = (req, res) => {
  res.render("index");
};

//
exports.submitForm = asyncHandler(async (req, res) => {
  let error = [];

  let { firstName, lastName, email, phone, acct_No, course } = req.body;

  //  @desc check if user fill all fields
  if (!firstName || !lastName || !email || !phone || !acct_No || !course) {
    error.push({ msg: "all field are required" });
    res.render("index", { error });

    return;
  }

  // @desc check if user enter valid email
  function validateEmail(email) {
    const regex =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
  }
  if (!validateEmail(email)) {
    error.push({ msg: "please enter a valid email" });
    res.render("index", { error });
    return;
  }

  // check if user email already exist

  const emailExist = await User.findOne({ email: email });
  const acctNoExist = await User.findOne({ acct_No: acct_No });
  // const emailExist = await User.findOne({ email: email });
  try {
    if (emailExist) {
      error.push({ msg: "Email already linked to existing registration" });
      res.render("index", { error });

      return;
    }
    if (acctNoExist) {
      error.push({
        msg: "account Number already linked to existing registration",
      });
      res.render("index", { error });

      return;
    }

    // validate acct no
    let bank_Code = 50304;
    try {
      let valiadateAccNo = await axios.get(
        `https://api.paystack.co/bank/resolve?account_number=${acct_No.trim()}&bank_code=${bank_Code}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );
      if (valiadateAccNo) {
        console.log(valiadateAccNo.data);

        const newUser = await new User({
          firstName,
          lastName,
          email,
          acct_No,
          phone,
          course,
        }).save();

        if (newUser) {
          // send confirmation mail
          sendEmail(
            email,
            "ReactHq registration ",
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
    <span style="box-sizing: border-box; color: #f15a24; font-weight: 600;">Hi ${firstName},</span>
    <br style="box-sizing: border-box;">
    <br style="box-sizing: border-box;"> Thanks for applying to join the Sprint program.
    <br style="box-sizing: border-box;">
    <br style="box-sizing: border-box;"> We are excited that you are ready to learn from our well taught leaders and industry champions.
    <br style="box-sizing: border-box;">
    <br style="box-sizing: border-box;"> In the coming days, one of our team members will be in touch with the details about the program, and about the status of your application.
    <br style="box-sizing: border-box;">
    <br style="box-sizing: border-box;"> We would not want you to miss this important information, so please look out for an email from us (especially the Promotion/Update Box). 
    Also keep your phone close as we might be sending you a text or even placing a call across to you. 
    <br style="box-sizing: border-box;">
    <br style="box-sizing: border-box;"> Welcome to a world of endless opportunities!
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

          res.redirect("https://internship.reactng.com");
        } else {
          res.render("index", {
            error,
            email,
          });
        }
      } else {
        error.push({ msg: "Account number does not exist" });
        res.render("index", { error });
        return;
      }
    } catch (err) {
      error.push({ msg: "Account number does not exist" });
      res.render("index", { error });
      return;
    }
  } catch (error) {
    console.log(error.message);

    res.render("index", {
      error: error.message,
    });
  }
});
