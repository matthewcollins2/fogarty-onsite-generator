// import mongoose from 'mongoose';
import mongoose from "mongoose";
const ReturnSchema = new mongoose.Schema(
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

        generatorModel: {
            type: String,
            required: false,
            default: ""
        },

        serialNumber: {
            type: String,
            required: false,
            default: ""
        },

        condition: {
            type: String,
            required: true,
            default: ""
        },

        reason: {
            type: String,
            required: false, // optional
            default: "",
        },

        status: {
            type: String,
            enum: ["Completed", "In-Progress", "Denied", "Pending"],
            default: "Pending"
        },

        
    },    
    { timestamps: true }
);

export default mongoose.model("Return", ReturnSchema);