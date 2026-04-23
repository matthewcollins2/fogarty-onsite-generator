import mongoose from 'mongoose';

const QuoteSchema = mongoose.Schema ({
    name: {
        type: String,
        reuqired: true,
        default: ""

    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email."],
    },
    phoneNumber: {
        type: Number,
        required: true,
        match: [/^\+?[0-9\s\-()]{10,15}$/, "Invalid phone number."],
    },
    genModel: {
        type: String,
        required: true,
        default: ""
    },
    genSerialNumber: {
        type: String,
        required: true,
        default: ""
    },
    additionalInfo: {
        type: String,
        reuqired: true,
        default: ""
    },
    acknowledged: {
        type: Boolean,
        default: false
    },
},
    {
        timestamps: true,
    }

)

const Quote = mongoose.model("Quote", QuoteSchema);

export default Quote;