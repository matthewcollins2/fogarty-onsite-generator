// const Appointment = require("../models/appointment.model");
// const User = require("../models/user.model");
import Appointment from "../models/appointment.model.js";
import User from "../models/user.model.js";
import PageContent from '../models/pagecontent.model.js';
import { sendEmail } from "../backend/services/emailService.js";
import { appointmentConfirmationTemplate,appointmentStatusTemplate } from "../backend/services/emailTemplates.js";
import { sendAdminNotification } from "../backend/services/appointmentMailer.js";
import { sendAdminText } from "../backend/services/appointmentText.js";

//get busy ranges for accepted/rescheduled appointments (for calendar blocking on frontend)
export const getBusyRanges = async (req, res) => {
  try {
    const from = new Date(req.query.from);
    const to = new Date(req.query.to);

    if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime())) {
      return res.status(400).json({ message: "Invalid from/to query params" });
    }

    // Pull only relevant fields
    const appts = await Appointment.find({
      status: { $in: ["accepted", "rescheduled"] },
    }).select(
      "status appointmentDateTime appointmentEndDateTime rescheduledDateTime rescheduledEndDateTime"
    );

    const busy = [];

    for (const a of appts) {
      // choose start based on status
      const start =
        a.status === "rescheduled" && a.rescheduledDateTime
          ? a.rescheduledDateTime
          : a.appointmentDateTime;

      // choose end based on status
      let end =
        a.status === "rescheduled" && a.rescheduledEndDateTime
          ? a.rescheduledEndDateTime
          : a.appointmentEndDateTime;

      // fallback end = start + 1 hour
      if (!end && start) end = new Date(start.getTime() + 60 * 60 * 1000);

      if (!start || !end) continue;

      // only return ranges overlapping requested window
      if (start < to && end > from) {
        busy.push({ start: start.toISOString(), end: end.toISOString() });
      }
    }

    return res.json(busy);
  } catch (err) {
    console.error("getBusyRanges error:", err);
    return res.status(500).json({ message: err.message });
  }
};
// GET all pending appointments
export const getAppointments = async (req, res) => {
  try {
    const rows = await Appointment.aggregate([
      { $match: { status: "pending" } },

      {
        $lookup: {
          from: User.collection.name,
          localField: "userID",
          foreignField: "userID",
          as: "user",
        },
      },

      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 1,
          createdBy: 1,
          appointmentDateTime: 1,
          rescheduledDateTime: 1,
          createdAt: 1,
          status: 1,
          description: 1,
          generatorModel: 1,
          serialNumber: 1,

          name: {
            $cond: [
              { $eq: ["$createdBy", "admin"] },
              { $ifNull: ["$name", "(admin: no name)"] },
              { $ifNull: ["$user.name", "(no name)"] },
            ],
          },
          phone: {
            $cond: [
              { $eq: ["$createdBy", "admin"] },
              { $ifNull: ["$phone", "(admin: no phone)"] },
              { $ifNull: ["$user.phoneNumber", "(no phone)"] },
            ],
          },
          email: {
            $cond: [
              { $eq: ["$createdBy", "admin"] },
              { $ifNull: ["$email", "(admin: no email)"] },
              { $ifNull: ["$user.email", "(no email)"] },
            ],
          },
          address: {
            $cond: [
              { $eq: ["$createdBy", "admin"] },
              { $ifNull: ["$address", "(admin: no address)"] }, 
              {
                $concat: [
                  { $ifNull: ["$user.address.street", ""] }, ", ",
                  { $ifNull: ["$user.address.city", ""] }, ", ",
                  { $ifNull: ["$user.address.state", ""] }, " ",
                  { $ifNull: ["$user.address.zipcode", ""] },
                  ]
                }
            ] 
          },
        },
      },
    ]);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// GET all reviewed appointments
export const getReviewedAppointments = async (req, res) => {
  try {
    const rows = await Appointment.aggregate([
      { $match: { status: { $ne: "pending" } } },

      {
        $lookup: {
          from: User.collection.name,
          localField: "userID",
          foreignField: "userID",
          as: "user",
        },
      },

      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      //get effective date for sorting.
      {
        $addFields: {
          effectiveDate: {
            $cond: [
              { $and: [{ $eq: ["$status", "rescheduled"] }, { $ne: ["$rescheduledDateTime", null] }] },
              "$rescheduledDateTime",
              "$appointmentDateTime",
            ],
          },
        },
      },
      { $sort: { effectiveDate: 1 } },

      {
        $project: {
          _id: 1,
          status: 1,
          createdAt: 1,
          createdBy: { $ifNull: ["$createdBy", "user"] }, 
          appointmentDateTime: 1,
          appointmentEndDateTime: 1,
          rescheduledDateTime: 1,
          rescheduledEndDateTime: 1,
          generatorModel: 1,
          serialNumber: 1,
          description: 1,

        name: {
            $cond: [
              { $eq: ["$createdBy", "admin"] },
              { $ifNull: ["$name", "(admin: no name)"] },
              { $ifNull: ["$user.name", "(no name)"] },
            ],
          },
          phone: {
            $cond: [
              { $eq: ["$createdBy", "admin"] },
              { $ifNull: ["$phone", "(admin: no phone)"] },
              { $ifNull: ["$user.phoneNumber", "(no phone)"] },
            ],
          },
          email: {
            $cond: [
              { $eq: ["$createdBy", "admin"] },
              { $ifNull: ["$email", "(admin: no email)"] },
              { $ifNull: ["$user.email", "(no email)"] },
            ],
          },
          address: {
            $cond: [
              { $eq: ["$createdBy", "admin"] },
              { $ifNull: ["$address", "(admin: no address)"] }, // admin is a single string, totally fine
              {
                $concat: [
                  { $ifNull: ["$user.address.street", ""] }, ", ",
                  { $ifNull: ["$user.address.city", ""] }, ", ",
                  { $ifNull: ["$user.address.state", ""] }, " ",
                  { $ifNull: ["$user.address.zipcode", ""] },
               ]
              }
            ]
          }
        },
      },
    ]);

    res.json(rows);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET single appointment
export const getAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: "Not found" });
    res.json(appt);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// CREATE appointment
export const createAppointment = async (req, res) => {
  try {
    const {
      userID,
      appointmentDateTime,
      appointmentEndDateTime,
      generatorModel,
      serialNumber,
      description,
      createdBy,
    } = req.body;

    const start = new Date(appointmentDateTime);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ message: "Invalid appointmentDateTime" });
    }
    let end = appointmentEndDateTime ? new Date(appointmentEndDateTime) : new Date(start.getTime() + 60 * 60 * 1000); // default +1 hour
    if (end <= start) {
      return res.status(400).json({ message: "End time must be after start time" }); 
    }

    const targetUID = userID || req.user?.uid;
    const dbUser = await User.findById(targetUID);

    console.log("PRE-SAVE DATA CHECK:", { generatorModel, serialNumber, description });
    const appt = await Appointment.create({
      userID: userID || req.user?.uid,
      name: req.body.name || dbUser?.name || req.user?.name,
      email: req.body.email || dbUser?.email || req.user?.email,
      phone: req.body.phone || dbUser?.phone || dbUser?.phoneNumber,
      appointmentDateTime: new Date(appointmentDateTime),
      appointmentEndDateTime: end,
      generatorModel,
      serialNumber,
      description,
      status: "pending",
      createdBy,
    });
    console.log("POST-SAVE DB OBJECT:", appt);

    await sendEmail(
      req.body.email,
      "Appointment Request Received",
      appointmentConfirmationTemplate({
        name: req.body.name,
        phone: req.body.phone || dbUser?.phone || dbUser?.phoneNumber,
        address: req.body.address || dbUser?.address || req.user?.address,
      })
    );

    await notifyAdminOfNewAppointment(appt);
    
    res.json({ message: "Appointment created", appt });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// NOTIFY admin
export const notifyAdminOfNewAppointment = async (appointment) => {
  const adminData = {
    name: appointment.name,
    email: appointment.email,
    phone: appointment.phone,
    model: appointment.generatorModel,
    serial: appointment.serialNumber,
    date: appointment.appointmentDateTime,
    notes: appointment.description
  };

  const results = await Promise.allSettled([
    sendAdminNotification(adminData),
    sendAdminText(adminData)
  ]);

  results.forEach((result, index) => {
    const type = index === 0 ? "Email" : "Text";
    if (result.status === "fulfilled") {
      console.log(`Admin notified via ${type}.`);
    } else {
      console.error(`${type} failed:`, result.reason.message);
    }
  });
};

// UPDATE appointment
export const updateAppointment = async (req, res) => {
  try {
    const update = {
     status: req.body.status,
     travelCost: typeof req.body.travelCost === "number" ? req.body.travelCost : undefined,
     rescheduledDateTime: req.body.rescheduledDateTime,
     rescheduledEndDateTime: req.body.rescheduledEndDateTime,
   };


   // ONLY for reschedule
   if (status === "rescheduled") {
    if (newAppointmentTime) {
     appointment.newAppointmentTime = newAppointmentTime;
   }
   if (newEndAppointmentTime) {
     appointment.newEndAppointmentTime = newEndAppointmentTime;
   }
 }
 // ONLY for reschedule
 if (status === "rescheduled") {
   if (newAppointmentTime) {
     appointment.newAppointmentTime = newAppointmentTime;
   }
   if (newEndAppointmentTime) {
     appointment.newEndAppointmentTime = newEndAppointmentTime;
   }
 }

 // travel cost for both accept + reschedule
 if (travelCost !== undefined) {
   appointment.travelCost = travelCost;
 }

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
      $set: {
      status: req.body.status,
      travelCost: typeof req.body.travelCost === "number" ? req.body.travelCost : undefined,
      rescheduledDateTime: req.body.rescheduledDateTime,
      rescheduledEndDateTime: req.body.rescheduledEndDateTime,
      }
      },
      { new: true }
    );
    if (!updated) {
   return res.status(404).json({ message: "Appointment not found" });
 }

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
await sendEmail(
  appointment.email,
  "Appointment Status Update",
  appointmentStatusTemplate({
    name: appointment.name,
    status: appointment.status
  })
);

};


// UPDATE status or reschedule
// controllers/appointment.controller.js
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { 
      status, 
      travelCost,
      newAppointmentTime,
      newEndAppointmentTime, 
      appointmentEndDateTime,
     } = req.body;
    
    // 1. Prepare the update object for the Database
    const update = { status };

    if (typeof travelCost === "number") {
   update.travelCost = travelCost;
 }

    if (status === "accepted" && appointmentEndDateTime) {
      update.appointmentEndDateTime = new Date(appointmentEndDateTime);
    }

   if (status === "rescheduled") {
  if (!newAppointmentTime) {
    return res.status(400).json({ message: "New time required" });
  }

  update.rescheduledDateTime = new Date(newAppointmentTime);

  if (newEndAppointmentTime) {
    update.rescheduledEndDateTime = new Date(newEndAppointmentTime);
  }
}
    // 2. Update the appointment in the DB
    const updatedAppt = await Appointment.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updatedAppt) return res.status(404).json({ message: "Appointment not found" });

    // 3. AUTOMATIC EMAIL TRIGGER based on new status
    (async () => {
      try {
        let recipientEmail = updatedAppt.email;
        let recipientName = updatedAppt.name;

        // If email isn't on the appointment, look up the User document
        if (!recipientEmail && updatedAppt.userID) {
          const user = await User.findOne({ userID: updatedAppt.userID });
          if (user) {
            recipientEmail = user.email;
            recipientName = user.name;
          }
        }

        // Only send if we found an email
        if (recipientEmail) {
          const emailHtml = appointmentStatusTemplate({
            name: recipientName || "Customer",
            status: status, // "accepted", "denied", or "rescheduled"
            newDate: status === "rescheduled" ? updatedAppt.rescheduledDateTime.toLocaleString() : null
          });

          await sendEmail(
            recipientEmail,
            `Update: Your Appointment is ${status.toUpperCase()}`,
            emailHtml
          );
          console.log(`Auto-email sent to ${recipientEmail} for status: ${status}`);
          
        } else {
          console.error("Could not find an email address for this appointment.");
        }
      } catch (err) {
        console.error("Auto-email failed:", err);
      }
    })();

    // 4. Send success back to the Admin Dashboard immediately
    return res.json({ message: `Appointment ${status} successfully`, updatedAppt });

  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: err.message });
  }
};



// DELETE appointment
export const deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const adminCreateAppointment = async (req, res) => {
  try {
    const {
      start,
      end,
      name,
      phone,
      email,
      address,
      generatorModel,
      serialNumber,
      description,
    } = req.body;

    if (!start || !end) return res.status(400).json({ message: "start and end are required" });

    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime())) return res.status(400).json({ message: "Invalid start" });
    if (isNaN(e.getTime())) return res.status(400).json({ message: "Invalid end" });
    if (e <= s) return res.status(400).json({ message: "End must be after start" });

    // TODO: conflict check (server-side) using your busy ranges logic
    // if conflict -> return res.status(409).json({ message: "Time conflicts" });

    const appt = await Appointment.create({
      createdBy: "admin",
      userID: null, // no userID since created by admin on behalf of customer
      status: "accepted", // usually yes for phone-call bookings
      appointmentDateTime: s,
      appointmentEndDateTime: e,

      // customer info typed by admin
      name: name ?? "",
      phone: phone ?? "",
      email: email ?? "",
      address: address ?? "",
      generatorModel: generatorModel ?? "",
      serialNumber: serialNumber ?? "",
      description: description ?? "",
    });

    res.status(201).json(appt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
export const getPendingCount = async (req, res) => {
  try {
    const count = await Appointment.countDocuments({ status: "pending" });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserAppointments = async (req, res) => {
  try {
    const userID = req.params.userID || req.user?.uid;
    
    if (!userID) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const appointments = await Appointment.find({ userID }).sort({ appointmentDateTime: 1 });
    
    res.json(appointments);
  } catch (err) {
    console.error("Error fetching user appointments:", err);
    res.status(500).json({ message: err.message });
  }
};


// // EXPORT EVERYTHING
// module.exports = {
//   getAppointments,
//   getReviewedAppointments,
//   getAppointment,
//   createAppointment,
//   updateAppointment,
//   updateAppointmentStatus,
//   deleteAppointment,
// };