import mongoose from "mongoose";

export const isValidatedObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
