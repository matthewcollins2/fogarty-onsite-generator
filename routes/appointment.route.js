
import express from "express";
const router = express.Router();
import Appointment from '../models/appointment.model.js';
import {getAppointments, getReviewedAppointments, getAppointment, createAppointment, updateAppointment, deleteAppointment, updateAppointmentStatus, 
  getBusyRanges, adminCreateAppointment, getPendingCount, getUserAppointments} from '../controller/appointment.controller.js';
import { verifyFirebaseToken } from '../backend/middleware/auth.ts';

router.get("/busy",getBusyRanges);
router.post("/admin-create", verifyFirebaseToken, adminCreateAppointment);  
router.get("/reviewed", getReviewedAppointments);
router.get("/pending-count", getPendingCount);
router.get("/user/:userID", getUserAppointments);
router.get("/", getAppointments);
router.get("/:id", getAppointment);
router.post("/", createAppointment);
router.put("/:id", updateAppointment);
router.patch("/:id/status", updateAppointmentStatus);
router.put("/:id/status", updateAppointmentStatus);
router.delete("/:id", deleteAppointment);
// Update appointment status
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rescheduledDateTime } = req.body;

    // This is the line that was failing because 'Appointment' was undefined
    const updated = await Appointment.findByIdAndUpdate(
      id,
      { status, rescheduledDateTime },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Appointment not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// module.exports = router;
export default router;