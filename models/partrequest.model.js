import mongoose from 'mongoose';

const PartRequestSchema  = mongoose.Schema(
    {
        name: {
            type: String,
            required: false,
            default: ""
        },

        email: {
            type: String,
            required: true,
            default: ""
        },

        phoneNumber: {
            type: Number,
            required: true,
            default: ""
        },
        address: {
            type: String,
            required: false, // for admins
            default: "",
        },
        partName: {
            type: String,
            required: true,
            default: ""
        },

        AdditionalInformation: {
            type: String,
            requried: false,
            default: ""
        },
        status: {
            type: String,
            required: false,
            enum: ["Completed", "In-Progress", "To-do", "Denied"],
            default: "To-do"
        }
    },
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true }
    }
);

const Partrequest = mongoose.model("Partrequest", PartRequestSchema);

export default Partrequest;