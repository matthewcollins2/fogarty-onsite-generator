import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: true,
      unique: true, 
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },

    permissions: {
      type: [String],
      default: ["manage_users", "view_reports", "modify_data"],
    },
    adminLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", AdminSchema);
export default Admin;
