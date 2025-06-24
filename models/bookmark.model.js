import mongoose from "mongoose";

export const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.mongoose,
    ref: "User",
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
});
