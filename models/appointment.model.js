// import mongoose from 'mongoose';
import mongoose from "mongoose";
const AppointmentSchema = new mongoose.Schema(
    {
        userID: {
            type: String,
            required: false,
            default: ""
        },
        name: {
            type: String,
            required: false, // for admins
            default: "",
        },
        email: {
            type: String,
            required: false, // for admins
            default: "",
        },
        phone: {    
            type: String,
            required: false, // for admins
            default: "",
        },
        address: {
            type: String,
            required: false, // for admins
            default: "",
        },
        appointmentDateTime: {
            type: Date,
            required: true
        },
         appointmentEndDateTime: {
            type: Date,
            required: true
        },
        rescheduledEndDateTime: {
            type: Date,
            default: null
        },
        rescheduledDateTime: {
            type: Date,
            default: null
        },
        generatorModel: {
            type: String,
            required: false, // optional
            default: "",
        },
        serialNumber: {
            type: String,
            required: false, // optional
            default: "",
        },
        description: {
            type: String,
            required: false, // optional
            default: "",
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "denied", "rescheduled"],
            default: "pending"
        },
        createdBy: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        travelCost: {
         type: Number,
         default: 0,
     },
        
    },    
    {
        timestamps: true,
    }

);

// const Appointment = mongoose.model("Appointment", AppointmentSchema);

// module.exports = Appointment;
export default mongoose.model("Appointment", AppointmentSchema);