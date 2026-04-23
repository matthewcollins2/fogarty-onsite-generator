import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { quoteHtmlEmail } from '../templates/quoteEmail.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log("MAIL_HOST check:", process.env.MAIL_HOST);

// Creates the transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Email formatting
const sendAdminNotification = async (clientData) => {
  const mailOptions = {
  from: '"Quote Requests Admin" <' + process.env.MAIL_USER + '>',
  to: process.env.MAIL_USER,
  /*
  // for testing purposes
  to: "testing@gmail",
  */
  subject: `New Quote Request: ${clientData.genModel}`,
  html: quoteHtmlEmail(clientData),
};

  try {
    console.log("Attempting to send email with these options:", mailOptions);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent to Mailtrap: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("DETAILED ERROR:", error); 
    throw error;
  }
};

export { sendAdminNotification };

