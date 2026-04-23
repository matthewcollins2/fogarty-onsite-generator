// backend/services/emailService.js

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * sendEmail
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} html - email body in HTML
 */
export const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Fogarty Generator Services" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully to", to, "MessageId:", info.messageId);
  } catch (error) {
    console.error("Email sending failed:", error);
  }
};