// backend/services/emailTemplates.js

/**
 * Appointment Confirmation Email Template
 * @param {Object} data - appointment data
 * @param {string} data.name
 * @param {string} data.phone
 * @param {string} data.address
 * @returns {string} HTML email
 */

export const appointmentConfirmationTemplate = (data) => {
  const addr = data.address;
  const addressString = addr 
    ? `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipcode}`
    : "No address provided";

  return `
    <h2>Appointment Request Received</h2>
    <p>Hello <b>${data.name}</b>,</p>

    <p>We have received your appointment request. It is currently <b>under review</b>.</p>

    <h3>Your Details:</h3>
    <p><b>Name:</b> ${data.name}</p>
    <p><b>Phone:</b> ${data.phone}</p>
    <p><b>Address:</b> ${addressString}</p>

    <p>We will notify you once the admin reviews your request.</p>

    <br/>
    <p>Fogarty Generator Services</p>
  `;
};

/**
 * Appointment Status Update Email Template
 * @param {Object} data - appointment data
 * @param {string} data.name
 * @param {string} data.status - "accepted", "denied", "rescheduled"
 * @param {string} [data.newDate] - optional, if rescheduled
 * @returns {string} HTML email
 */
export const appointmentStatusTemplate = (data) => {
  return `
    <h2>Appointment Status Update</h2>
    <p>Hello <b>${data.name}</b>,</p>

    <p>Your appointment request has been <b>${data.status}</b>.</p>

    ${
      data.status === "rescheduled"
        ? `<p>New Appointment Date & Time: <b>${data.newDate}</b></p>`
        : ""
    }

    <p>If you have any questions, please contact us.</p>

    <br/>
    <p>Fogarty Generator Services</p>
  `;
};

export const quoteRequestTemplate = (data) => {
  return `
    <h2>Quote Request Received</h2>
    <p>Hello <b>${data.name}</b>,</p>
    <p>Your quote request has been received and is under review.</p>
    <p><b>Phone:</b> ${data.phone}</p>
    <p><b>Generator Model:</b> ${data.model}</p>
    <p><b>Serial Number:</b> ${data.serial}</p>
    <p><b>Additional Notes:</b> ${data.notes}</p>
  `;
};