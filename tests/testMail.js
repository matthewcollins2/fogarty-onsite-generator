import { sendEmaill } from "../backend/services/mailService.js";

sendEmaill({
  to: "anyone@example.com",
  subject: "Mailtrap Test",
  html: "<h1>Hello from Selenium Test!</h1>",
});