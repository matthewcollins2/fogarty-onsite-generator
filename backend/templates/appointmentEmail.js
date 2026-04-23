export const appointmentHtmlEmail = (clientData) => {
  return `
    <div style="background-color: #ffffff; padding: 40px 0; font-family: sans-serif; width: 100%;">
      <center>
        
        <div style="background-color: #f4f4f4; width: 200px; padding: 10px; border-radius: 8px 8px 0 0; border: 1px solid #ddd; border-bottom: none;">
          <span style="font-size: 14px; font-weight: bold; color: #555; text-transform: uppercase; letter-spacing: 1px;">
            Notification
          </span>
        </div>

        <div style="background-color: #f4f4f4; max-width: 500px; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #ddd; text-align: left; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          
          <h2 style="margin-top: 0; color: #333; text-align: center;">New Appointment Request</h2>
          <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;" />
          
          <p style="margin: 10px 0;"><strong style="color: #555;">Name:</strong> ${clientData.name}</p>
          <p style="margin: 10px 0;"><strong style="color: #555;">Email:</strong> ${clientData.email}</p>
          <p style="margin: 10px 0;"><strong style="color: #555;">Phone:</strong> ${clientData.phone}</p>
          <p style="margin: 10px 0;"><strong style="color: #555;">Generator Model:</strong> ${clientData.model}</p>
          <p style="margin: 10px 0;"><strong style="color: #555;">Serial Number:</strong> ${clientData.serial}</p>
          <p style="margin: 10px 0;"><strong style="color: #555;">Date:</strong> ${clientData.date}</p>
          
          <p style="margin: 20px 0 5px 0;"><strong style="color: #555;">Additional Notes:</strong></p>
          <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #eee; color: #444; line-height: 1.6;">
            ${clientData.notes || "No additional notes provided."}
          </div>

          <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
            This is an automated notification from Fogarty Onsite Generator Services (Admin).
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <a href="http://localhost:5173/admin/incoming/appointments" 
            style="background-color: #333; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            View in Admin Dashboard
          </a>
        </div>
      </center>
    </div>
  `;
};