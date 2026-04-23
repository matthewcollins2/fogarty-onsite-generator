import { Courier } from "@trycourier/courier"
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const courier = new Courier({ 
  authorizationToken: process.env.COURIER_API_KEY
});

/**
 * Service to handle appointment request admin notifications
 */
export const sendAdminText = async (clientData) => {
  try {
    const { requestId } = await courier.send.message({
      message: {
        to: {
          phone_number: process.env.ADMIN_PHONE, 
        },
        template: process.env.COURIER_SMS_APPOINTMENT,
        data: {
          name: clientData.name,
          email: clientData.email,
          phoneNumber: clientData.phone,
          genModel: clientData.model,
          serialNumber: clientData.serial,
          date: new Date(clientData.date).toLocaleString(),
          message: clientData.notes || "None",
        },
      },
    });
  } catch (error) {
    console.error("Courier Service Error:", error);
    throw error; // Pass the error up so the route can handle it
  }
};