const nodemailer = require("nodemailer");
const { google } = require("googleapis");

module.exports = async (email, subject, html) => {
  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRETE = process.env.CLIENT_SECRETE;
  const REDIRECT_URI = process.env.REDIRECT_URL;
  const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRETE,
    REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  const accessToken = await oAuth2Client.getAccessToken();
  let transporter = await nodemailer.createTransport({
    service: "gmail",

    auth: {
      type: "OAuth2",
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRETE,
      refreshToken: accessToken,
      user: process.env.EMAIL,
      accessToken: accessToken,
      // pass: process.env.PASSWORD,
    },
  });

  var mailOptions = {
    from: `ReactHq "no-reply@reactHq.com"`,
    replyTo: "no-reply@reactHq.com",
    to: email,
    subject: subject,
    html: html,
  };

  await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
