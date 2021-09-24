import nodemailer from "nodemailer";

let sendEmailDemo = () => {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST_URL,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  let info = transporter.sendMail({
    from: '"Testiny" <no-reply@testiny.live>',
    to: "user@example.com",
    subject: "Testiny - Verify your email address",
    text: "Hello. what?",
    html:
      '<b>Something here</b> <a target="_blank" href="https://testiny.live" rel="noopener">click here to verify your account.</a>',
  });
  console.log("Email sent!");
  console.log(info);
};
