import nodemailer from "nodemailer";

// Mailtrap transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER, // your email
    pass: process.env.MAIL_PASS, // app password for Gmail
  },
});

export const sendEmaill = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: '"Test App" <test@example.com>',
      to,
      subject,
      html,
    });
    console.log("Email sent! ID:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};