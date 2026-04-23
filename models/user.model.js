import mongoose from "mongoose";

const stateAbbreviations = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const AddressSchema = new mongoose.Schema({
  street: { type: String, required: true, default: "" },
  city: { type: String, required: true, default: "" },
  state: { 
    type: String, 
    required: true, 
    uppercase: true, 
    enum: stateAbbreviations 
  },
  zipcode: { type: String, required: true, default: "" }
});

const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: String, // Stores the Firebase UID
      required: true,
    },
    userID: {
      type: String,
      required: true,
      unique: true 
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    name: {
      type: String,
      required: true,
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
      type: String, // Changed to String to support Regex and leading zeros
      required: true,
      match: [/^\+?[0-9\s\-()]{10,15}$/, "Invalid phone number."],
    },
    password: {
      type: String,
      required: false, // Firebase handles passwords; MongoDB does not need them
    },
    address: {
      type: AddressSchema,
      required: false
    },
    receiveTexts: {
      type: Boolean,
      default: false,
    },
    receiveEmails: {
      type: Boolean,
      default: false,
    },
    favorites: [
      {
        itemId: {
          type: String,
          required: true
        }, 
        itemType: {
        type: String,
        enum: ["generator", "part"],
        required: true
        }
      }
    ]

  },
  {
    timestamps: true,
    discriminatorKey: "userType",
  },
);

export default mongoose.model("User", UserSchema);