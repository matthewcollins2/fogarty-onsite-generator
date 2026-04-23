import mongoose from "mongoose";
import { randomUUID } from "crypto";

const ReviewSchema = new mongoose.Schema(
  {
    reviewID: {
      type: String,
      required: true,
      default: () => randomUUID(),
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
     service: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Review", ReviewSchema);