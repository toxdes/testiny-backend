const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const sendEmails = async () => {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST_URL,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  let mailOptions = {
    from: '"Testiny" <no-reply@testiny.live>',
    to: "success@simulator.amazonses.com",
    subject: "Testiny - Verify your email address",
    text: "Hello. what? ",
    html:
      '<b>Something here</b> <a target="_blank" href="https://testiny.live" rel="noopener">click here to verify your account.</a>',
  };
  // trying out the different ways the email should be handled
  let info = await transporter.sendMail({ ...mailOptions });
  console.log(`[SCRIPT] normal mail sent to ${mailOptions.to}`, info);
  mailOptions.to = "success@simulator.amazonses.com";
  info = await transporter.sendMail({ ...mailOptions });
  console.log(`[SCRIPT] success mail sent to ${mailOptions.to}`, info);
  mailOptions.to = "bounce@simulator.amazonses.com";
  info = await transporter.sendMail({ ...mailOptions });
  console.log(`[SCRIPT] bounce mail sent to ${mailOptions.to}`, info);
  mailOptions.to = "complaint@simulator.amazonses.com";
  info = await transporter.sendMail({ ...mailOptions });
  console.log(`[SCRIPT] complaint mail sent to ${mailOptions.to}`, info);
  mailOptions.to = "ooto@simulator.amazonses.com";
  info = await transporter.sendMail({ ...mailOptions });
  console.log(`[SCRIPT] ooto mail sent to ${mailOptions.to}`, info);
  mailOptions.to = "suppressionlist@simulator.amazonses.com";
  info = await transporter.sendMail({ ...mailOptions });
  console.log(`[SCRIPT] suppresionlist mail sent to ${mailOptions.to}`, info);
};

sendEmails();
