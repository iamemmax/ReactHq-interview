const nodemailer = require("nodemailer");

module.exports = async (email, subject, html) => {
  let transporter = await nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
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
